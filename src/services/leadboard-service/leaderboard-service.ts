

class LeaderBoard {

    private static instance: LeaderBoard;

    private constructor() {
        // private constructor
    }

    public static getInstance(): LeaderBoard {
        if (!LeaderBoard.instance) {
            LeaderBoard.instance = new LeaderBoard();
        }

        return LeaderBoard.instance;
    }

    public getLeaderBoard() {
        // get leaderboard logic
    }
}