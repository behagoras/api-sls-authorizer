
import { APIGatewayTypedEvent } from '@types';
import getEndedAuctions from "./getEndedAuctions";

export const processAuctions = async (
  event: APIGatewayTypedEvent<{}, {}>,
  context,
): Promise<void> => {
  const auctionsToClose = await getEndedAuctions();
  console.log(auctionsToClose);
};

export const main = processAuctions;