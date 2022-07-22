import fetch from 'cross-fetch';

export const author = 'bonustrack';
export const version = '0.1.1';

const graphqlParams = (space: string) => {
  return {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      operationName: 'Votes',
      query: `query Votes {
      votes (
        where: {
          space: "${space}"
        }
      ) {
        id
        voter
        created
        choice
        proposal {
          id
        }
      }
    }`
    })
  };
};

interface Vote {
  id: string;
  voter: string;
  created: number;
  choice: number;
  proposal: {
    id: string;
  };
}

const countVotesForAddress = (voterAddress: string, votes: Vote[]) => {
  const v = votes.reduce(
    (prev, current) => prev + (current.voter === voterAddress ? 1 : 0),
    0
  );
  return v > 0 ? v * -1 : 0;
};

export async function strategy(
  space,
  network,
  provider,
  addresses,
  options,
  snapshot
): Promise<Record<string, number>> {
  const graphqlQuery = await fetch(
    'https://hub.snapshot.org/graphql',
    graphqlParams('test.bluepartyhat.eth') // test.bluepartyhat.eth
  );
  const graphqlData = await graphqlQuery.json();
  const votes: Vote[] = graphqlData.data.votes;

  const votesCasted = addresses.map((address) => {
    return { [address]: countVotesForAddress(address, votes) };
  });
  console.log(votesCasted);
  return votesCasted;
}
