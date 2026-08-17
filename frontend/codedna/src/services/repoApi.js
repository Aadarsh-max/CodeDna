import api from "./api.js";

const importFromGithub = async (githubUrl) => {
  const response = await api.post("/repos/github", { githubUrl });
  return response.data;
};

const importFromZip = async (file) => {
  const formData = new FormData();
  formData.append("file", file);
  const response = await api.post("/repos/upload", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return response.data;
};

const getRepos = async () => {
  const response = await api.get("/repos");
  return response.data;
};

export default { importFromGithub, importFromZip, getRepos };