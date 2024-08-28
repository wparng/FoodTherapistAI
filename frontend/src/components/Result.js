import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import Modal from "./Modal";

const tongueImages = {
  TWF: "/assets/images/twf-image.jpg",
  TYF: "/assets/images/tyf-image.jpg",
  WGF: "/assets/images/wgf-image.jpg",
  YGF: "/assets/images/ygf-image.jpg",
};

const symptomsMap = {
  TWF: "Symptoms for TWF...",
  TYF: "Symptoms for TYF...",
  WGF: "Symptoms for WGF...",
  YGF: "Symptoms for YGF...",
};

const Result = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { image } = location.state || {};
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [modalMessage, setModalMessage] = useState("");

  useEffect(() => {
    const fetchResult = async () => {
      try {
        const formData = new FormData();
        formData.append("photo", image);
        // BACKEND_API_URL
        const response = await axios.post("backend-api", formData, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        });

        setResult(response.data);
      } catch (error) {
        setModalMessage("Error fetching results. Please try again later.");
        setShowModal(true);
      } finally {
        setLoading(false);
      }
    };

    if (image) {
      fetchResult();
    }
  }, [image]);

  const handleRecommendations = () => {
    navigate("/recommendations");
  };

  const handleShare = async () => {
    const resultType = result?.type;
    const resultImage = tongueImages[resultType];

    if (resultImage) {
      if (navigator.share) {
        try {
          await navigator.share({
            url: resultImage,
          });
        } catch (error) {
          console.error("Error sharing:", error);
        }
      } else {
        try {
          await navigator.clipboard.writeText(resultImage);
          alert("Image URL copied to clipboard!");
        } catch (error) {
          console.error("Error copying to clipboard:", error);
        }
      }
    } else {
      setModalMessage("No image available to share.");
      setShowModal(true);
    }
  };

  if (loading) {
    return <p>Loading...</p>;
  }

  const resultType = result?.type;
  const resultImage = tongueImages[resultType] || null;
  const symptoms = symptomsMap[resultType] || "No symptoms available.";

  return (
    <div className="app result">
      <h1>Analysis Result</h1>
      {result ? (
        <div>
          <h2>{result.title}</h2>
          {resultImage && (
            <>
              <img src={resultImage} alt={`Result for ${resultType}`} />
              <button onClick={handleShare} style={{ marginTop: "10px" }}>
                Share Image
              </button>
            </>
          )}
          <p>Associated Symptoms: {symptoms}</p>

          <h2>Recommended Foods and Teas</h2>
          <button onClick={handleRecommendations}>
            View Full Recommendations
          </button>
        </div>
      ) : (
        <p>No result available.</p>
      )}
      {showModal && (
        <Modal
          heading="Warning"
          message={modalMessage}
          onClose={() => setShowModal(false)}
        />
      )}
    </div>
  );
};

export default Result;
