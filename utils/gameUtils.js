export const updateGameStats = async (
  gameResult,
  solvedProblem = null,
  newRating = null
) => {
  try {
    const response = await fetch("/api/user/stats", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        gameResult, // 'win' or 'lose'
        solvedProblem,
        newRating,
      }),
    });

    if (response.ok) {
      return await response.json();
    } else {
      throw new Error("Failed to update game stats");
    }
  } catch (error) {
    console.error("Error updating game stats:", error);
    throw error;
  }
};
