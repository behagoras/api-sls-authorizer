import { APIGatewayProxyEvent } from "aws-lambda";

export type APIGatewayTypedEvent<T> = Omit<APIGatewayProxyEvent, "body"> & { body: T };