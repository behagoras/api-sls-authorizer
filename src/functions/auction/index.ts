import { default as createAuction } from './create'
import { default as getAuctions } from './getAll'
import { default as getAuction } from './getAuction'
import { default as placeBid } from './bid'


const auctionFunctions = {
  createAuction,
  getAuctions,
  getAuction,
  placeBid,
}

export default auctionFunctions;