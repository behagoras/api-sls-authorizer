import { Auction, AUCTION_STATUS, AuctionSchema } from '@functions/auction/auctionsSchema';
import { v4 as uuid } from 'uuid';

export function createNewAuctionItem(
  title: string,
  createdDate: Date = new Date(),
  endingAt: Date = new Date(createdDate.getTime() + 60 * 60 * 1000)
): Auction {
  return {
    id: uuid(),
    title,
    status: AUCTION_STATUS.OPEN,
    createdAt: createdDate.toISOString(),
    endingAt: endingAt.toISOString(),
    highestBid: {
      amount: 0,
      bidder: null
    }
  };
}


export function formatAuctionFromDynamo(item: any): Auction {
  return {
    id: item.id?.S ?? '',
    title: item.title?.S ?? '',
    status: (item.status?.S ?? 'OPEN') as AUCTION_STATUS,
    createdAt: item.createdAt?.S ?? '',
    endingAt: item.endingAt?.S ?? '',
    highestBid: {
      amount: item.highestBid?.amount ?? 0,
      bidder: item.highestBid?.bidder ?? null
    }
  };
}