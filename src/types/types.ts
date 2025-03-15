import { APIGatewayProxyEvent } from "aws-lambda";

export type APIGatewayTypedEvent<T={}, P = {}> = Omit<APIGatewayProxyEvent, "body"> & { body: T, pathParameters: P };