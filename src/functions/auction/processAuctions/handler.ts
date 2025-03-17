
import createError from 'http-errors';

import { closeAuction } from '@utils';
import getEndedAuctions from "./getEndedAuctions";

export const processAuctions = async (
  event,
  context,
): Promise<{ closed: number }> => {
  const auctionsToClose = await getEndedAuctions();
  console.log(auctionsToClose);
  const closePromises = auctionsToClose.map((auction) => closeAuction(auction));
  try {
    await Promise.all(closePromises);
    console.log('Closed auctions:', closePromises.length);
    return { closed: closePromises.length };
  } catch (error) {
    console.error(error);
    throw new createError.InternalServerError(error);
  }
};

export const main = processAuctions;