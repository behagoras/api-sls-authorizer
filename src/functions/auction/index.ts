import { default as createAuction } from './create'
import { default as getAuctions } from './getAll'
import { default as getAuction } from './getAuction'


const auctionFunctions = {
  createAuction,
  getAuctions,
  getAuction,
}

export default auctionFunctions;