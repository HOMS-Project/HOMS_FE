import api from "./api"

export const sendMessage = async (message)=>{
    try{
        const res = await api.post("/ai/chat",{message});
        return res.data.reply;
    }catch(error){
        console.error("Error:",error)
        throw error;
    }
}

export const summarizeReviews = async (reviews) => {
  try {
    const res = await api.post("/ai/analyze-sentiment", { reviews });
    return res.data.summary;
  } catch (err) {
    console.error("Error summarizing reviews:", err);
    throw err;
  }
};

export const getAiRecommendations = async (filters, rooms) => {
  try {
    const res = await api.post("/ai/recommend-simple", { filters, rooms });
    return res.data.recommended || [];
  } catch (err) {
    console.error("getAiRecommendations error:", err);
    throw err;
  }
};