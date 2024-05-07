import {
  ClientRMQ,
  ReadPacket,
  RmqRecord,
  WritePacket,
} from '@nestjs/microservices';

import {
  RQM_DEFAULT_IS_GLOBAL_PREFETCH_COUNT,
  RQM_DEFAULT_PREFETCH_COUNT,
} from '@nestjs/microservices/constants';
import { randomStringGenerator } from '@nestjs/common/utils/random-string-generator.util';
import {
  AmqplibExchangeOptions,
  RmqExchangeOptions,
} from './rmq-exchange-options';

export class RmqExchangeClient extends ClientRMQ {
  protected exchange: string;
  protected exchangeType: string;
  protected exchangeRoutingKey: string;
  protected exchangeOptions: AmqplibExchangeOptions;

  constructor(protected readonly options: RmqExchangeOptions['options']) {
    super(options);
    this.exchange = this.getOptionsProp(this.options, 'exchange');
    this.exchangeType = this.getOptionsProp(this.options, 'exchangeType');
    this.exchangeRoutingKey = this.getOptionsProp(
      this.options,
      'exchangeRoutingKey',
    );
    this.exchangeOptions = this.getOptionsProp(this.options, 'exchangeOptions');
  }

  async setupChannel(channel, resolve) {
    const prefetchCount =
      this.getOptionsProp(this.options, 'prefetchCount') ||
      RQM_DEFAULT_PREFETCH_COUNT;
    const isGlobalPrefetchCount =
      this.getOptionsProp(this.options, 'isGlobalPrefetchCount') ||
      RQM_DEFAULT_IS_GLOBAL_PREFETCH_COUNT;

    if (!this.exchangeOptions.noAssert) {
      await this.channel.assertExchange(
        this.exchange,
        this.exchangeType,
        this.exchangeOptions,
      );
    }

    if (!this.queueOptions.noAssert) {
      await channel.assertQueue(this.queue, this.queueOptions);
    }

    if (!this.exchangeOptions.noAssert && !this.queueOptions.noAssert) {
      await this.channel.bindQueue(this.queue, this.exchange);
    }

    await channel.prefetch(prefetchCount, isGlobalPrefetchCount);
    await this.consumeChannel(channel);
    resolve();
  }

  publish(
    message: ReadPacket,
    callback: (packet: WritePacket) => any,
  ): () => void {
    try {
      const correlationId = randomStringGenerator();
      const listener = ({
        content,
        options,
      }: {
        content: Buffer;
        options: Record<string, unknown>;
      }) =>
        this.handleMessage(
          this.parseMessageContent(content),
          options,
          callback,
        );

      Object.assign(message, { id: correlationId });
      const serializedPacket: ReadPacket & Partial<RmqRecord> =
        this.serializer.serialize(message);

      delete serializedPacket.options;

      this.responseEmitter.on(correlationId, listener);
      this.channel
        .publish(
          this.exchange,
          this.exchangeRoutingKey,
          Buffer.from(JSON.stringify(serializedPacket)),
          {},
        )
        .catch((err) => callback({ err }));

      return () => this.responseEmitter.removeListener(correlationId, listener);
    } catch (err) {
      callback({ err });
    }
  }
}
