import { GetServerSideProps, NextPage } from "next";
import { useState } from "react";
import axios from "axios";
import fs from "fs/promises";
import path from "path";
import Link from "next/link";
import CircularWithValueLabel from "./components/CircularProgressWithLabel";

interface Props {
  dirs: string[];
}

const Home: NextPage<Props> = ({ dirs }) => {
  const [uploading, setUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File>();
  const [isPaused, setPause] = useState(true);

  const handleUpload = async () => {
    try {
      if (!selectedFile) {
        alert("Please select a zip file")
        return
      }
      setPause(false)
      setUploading(true);
      const formData = new FormData();
      formData.append("file", selectedFile);
      await axios.post("/api/upload", formData)
      .catch(function (error) {
        if (error.response) {
          console.log(error.response.data);
          console.log(error.response.status);
          console.log(error.response.headers);
          alert("INVALID FILE")
        }
      });
    } catch (error: any) {
      console.log(error.response?.data);
    }
  };

  const handlePause = async () => {
    setPause(true)
  }

  const handleContinue = async () => {
    setPause(false)
  }

  return (
    <div className="">
      <input
        type="file"
        onChange={({ target }) => {
          if (target.files) {
            const file = target.files[0];
            setSelectedFile(file);
          }
        }}
      />

      <button
        onClick={handleUpload}
        disabled={uploading}
        style={{ opacity: uploading ? ".5" : "1" }}
        className=""
      >
        {uploading ? "Uploading.." : "Upload"}
      </button>

      <button onClick={handlePause} disabled={isPaused}>
        Pause
      </button>
      <button onClick={handleContinue} disabled={!uploading}>
        Continue
      </button>

      <CircularWithValueLabel value={0} isPaused={isPaused} done={handleContinue}/>

      <div className="mt-20 flex flex-col space-y-3">
        {dirs.map((item) => (
          <>
          <br/>
          <Link key={item} href={"/extracted/" + item} rel="noopener noreferrer" target="_blank">
            {item}
          </Link>
          </>
        ))}
      </div>
    </div>
  );
};

export const getServerSideProps: GetServerSideProps = async () => {
  const props = { dirs: [] };
  try {
    const dirs = await fs.readdir(path.join(process.cwd(), "/public/extracted"));
    props.dirs = dirs as any;
    return { props };
  } catch (error) {
    return { props };
  }
};

export default Home;