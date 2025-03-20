import { Auction } from '@types';
import { updateAuctionStatus } from '@repositories/auctionRepository';
import { AUCTION_STATUS } from '@types';

/**
 * Close an auction by updating its status to CLOSED
 * 
 * @param auction Auction to close
 */
export async function closeAuction(auction: Auction): Promise<void> {
  if (auction.status === AUCTION_STATUS.CLOSED) {
    console.log(`Auction ${auction.id} is already closed`);
    return;
  }
  
  console.log(`Closing auction ${auction.id}: ${auction.title}`);
  await updateAuctionStatus(auction.id, AUCTION_STATUS.CLOSED);
}

export default closeAuction; 