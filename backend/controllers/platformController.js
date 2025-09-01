import axios from 'axios';

export const getLeetCodeStats = async (req, res) => {
    const { username } = req.params;
    if (!username) return res.status(400).json({ msg: 'Username is required' });
    const LEETCODE_API_ENDPOINT = 'https://leetcode.com/graphql';
    const GRAPHQL_QUERY = `
      query getUserProfile($username: String!) {
        matchedUser(username: $username) {
          submitStatsGlobal { acSubmissionNum { difficulty count } }
        }
      }`;
    try {
        const response = await axios.post(LEETCODE_API_ENDPOINT, { query: GRAPHQL_QUERY, variables: { username: username } });
        const data = response.data.data.matchedUser;
        if (!data) return res.status(404).json({ msg: 'LeetCode user not found' });
        res.json(data);
    } catch (error) {
        res.status(500).send('Server Error fetching LeetCode data');
    }
};

export const getCodeforcesStats = async (req, res) => {
    const { username } = req.params;
    if (!username) return res.status(400).json({ msg: 'Username is required' });
    const CODEFORCES_API_ENDPOINT = `https://codeforces.com/api/user.status?handle=${username}`;
    try {
        const response = await axios.get(CODEFORCES_API_ENDPOINT);
        if (response.data.status !== 'OK') {
            return res.status(404).json({ msg: 'Codeforces user not found' });
        }
        res.json(response.data.result);
    } catch (error) {
        res.status(500).send('Server Error fetching Codeforces data');
    }
};

