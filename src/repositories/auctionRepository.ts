import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { 
  DynamoDBDocumentClient, 
  GetCommand, 
  QueryCommand, 
  PutCommand, 
  UpdateCommand,
  UpdateCommandInput 
} from "@aws-sdk/lib-dynamodb";
import { Auction, AUCTION_STATUS } from "@types";

const client = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(client);
const tableName = process.env.AUCTION_TABLE_NAME;

/**
 * Get an auction by ID
 */
export const getAuctionById = async (id: string): Promise<Auction | null> => {
  const params = {
    TableName: tableName,
    Key: { id }
  };

  const command = new GetCommand(params);
  const { Item } = await docClient.send(command);
  
  return Item as Auction || null;
};

/**
 * Get all auctions
 */
export const getAllAuctions = async (): Promise<Auction[]> => {
  const params = {
    TableName: tableName,
  };

  const command = new QueryCommand(params);
  const { Items } = await docClient.send(command);
  
  return (Items || []) as Auction[];
};

/**
 * Get all ended auctions that are still open
 */
export const getEndedAuctions = async (): Promise<Auction[]> => {
  const now = new Date();
  
  const params = {
    TableName: tableName,
    IndexName: 'statusAndEndDate',
    KeyConditionExpression: '#status = :status',
    FilterExpression: 'endingAt <= :now',
    ExpressionAttributeValues: {
      ':status': AUCTION_STATUS.OPEN,
      ':now': now.toISOString(),
    },
    ExpressionAttributeNames: {
      '#status': 'status',
    },
  };

  const command = new QueryCommand(params);
  const { Items } = await docClient.send(command);
  
  return (Items || []) as Auction[];
};

/**
 * Create a new auction
 */
export const createAuction = async (auction: Auction): Promise<Auction> => {
  const params = {
    TableName: tableName,
    Item: auction,
  };

  const command = new PutCommand(params);
  await docClient.send(command);
  
  return auction;
};

/**
 * Update an auction's status
 */
export const updateAuctionStatus = async (id: string, status: AUCTION_STATUS): Promise<void> => {
  const params = {
    TableName: tableName,
    Key: { id },
    UpdateExpression: 'set #status = :status',
    ExpressionAttributeValues: {
      ':status': status,
    },
    ExpressionAttributeNames: {
      '#status': 'status',
    },
  };

  const command = new UpdateCommand(params);
  await docClient.send(command);
};

/**
 * Place a bid on an auction
 */
export const placeBid = async (id: string, amount: number, bidder: string): Promise<Auction> => {
  const params: UpdateCommandInput = {
    TableName: tableName,
    Key: { id },
    UpdateExpression: 'set highestBid.amount = :amount, highestBid.bidder = :bidder',
    ExpressionAttributeValues: {
      ':amount': amount,
      ':bidder': bidder,
    },
    ReturnValues: 'ALL_NEW',
  };

  const command = new UpdateCommand(params);
  const { Attributes } = await docClient.send(command);
  
  return Attributes as Auction;
}; 