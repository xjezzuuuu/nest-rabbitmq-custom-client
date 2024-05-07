import {
  CustomClientOptions,
  Deserializer,
  RmqOptions,
  Serializer,
} from '@nestjs/microservices';
import {
  AmqpConnectionManagerSocketOptions,
  AmqplibQueueOptions,
  RmqUrl,
} from '@nestjs/microservices/external/rmq-url.interface';

export interface RmqExchangeOptions extends RmqOptions {
  customClass: CustomClientOptions;
  options: {
    urls?: string[] | RmqUrl[];
    exchange?: string;
    exchangeType?: string;
    exchangeRoutingKey?: string;
    exchangeOptions?: AmqplibExchangeOptions;
    queue?: string;
    prefetchCount?: number;
    isGlobalPrefetchCount?: boolean;
    queueOptions?: AmqplibQueueOptions;
    socketOptions?: AmqpConnectionManagerSocketOptions;
    noAck?: boolean;
    consumerTag?: string;
    serializer?: Serializer;
    deserializer?: Deserializer;
    replyQueue?: string;
    persistent?: boolean;
    headers?: Record<string, string>;
    noAssert?: boolean;
    maxConnectionAttempts?: number;
  };
}

export interface AmqplibExchangeOptions {
  alternateExchange?: string;
  arguments?: any;
  autoDelete?: boolean;
  durable?: boolean;
  internal?: boolean;
  noAssert?: boolean;
}
