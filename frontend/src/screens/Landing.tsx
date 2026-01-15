import { useNavigate } from "react-router-dom";
import { Button } from "../Components/Button";

export const Landing = () => {
  const navigate = useNavigate();
  return (
    <div className="flex justify-center">
      <div className="pt-9 max-w-5xl">
        <div className="grid gird-cols-1 gap-4 md:grid-cols-2">
          <div className="flex justify-center">
            <img src={"chessboard.jpeg"} className="max-w-96" />
          </div>
          <div className="pt-16">
            <div className="flex justify-center">
              <h1 className="text-4xl font-bold text-white">
                Play Chess Online on the #2 Site!
              </h1>
            </div>
            <div className="mt-8 flex justify-center">
              <Button onClick={()=>{
                navigate('/game')
              }}>Play Online</Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
