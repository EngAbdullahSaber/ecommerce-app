import { api } from "../axios";

export async function GetPanigationMethod(
  url: any,
  page: any,
  pageSize: any,
  lang: any, // Added missing comma here
  searchTerm: any
) {
  // Build query parameters
  const params = new URLSearchParams({
    page: page.toString(),
    pageSize: pageSize.toString(),
  });

  // Only add search term if it's provided and not empty
  if (searchTerm && searchTerm.trim() !== "") {
    params.append("name", searchTerm.trim());
  }

  let res = await api.get(`${url}?${params.toString()}`, {
    headers: {
      lang: lang,
    },
  });

  if (res) return res.data;
  else return false;
}
export const GetPanigationMethodWithFilter = async (
  endpoint: string,
  page: number,
  pageSize: number,
  lang?: any,
  searchTerm?: string,
  additionalParams?: any
) => {
  const params = new URLSearchParams({
    page: page.toString(),
    pageSize: pageSize.toString(),
    ...(searchTerm && { title: searchTerm }),
    ...additionalParams,
  });

  try {
    const response = await api.get(`/${endpoint}?${params}`, {
      headers: {
        lang: lang,
      },
    });

    return response.data;
  } catch (error) {
    throw error;
  }
};
export async function UpdateMethod(url: string, data: any, id: any, lang: any) {
  let res = await api.patch(`${url}/${id}`, data, {
    headers: {
      lang: lang,
    },
  });
  if (res) return res.data;
  else return false;
}
export async function GetSpecifiedMethod(url: string, lang: any) {
  try {
    const res = await api.get(`${url}`, {
      headers: {
        lang: lang,
      },
    });
    return res.data;
  } catch (error) {
    console.error("Error in GetMethod:", error);
    throw error;
  }
}
export async function CreateMethod(url: string, data: any, lang: any) {
  let res = await api.post(`${url}`, data, {
    headers: {
      lang: lang,
    },
  });
  if (res) return res.data;
  else return false;
}
export async function DeleteMethod(url: string, id: any, lang: any) {
  let res = await api.delete(`${url}/${id}`, {
    headers: {
      lang: lang,
    },
  });
  if (res) return res.data;
  else return false;
}
export async function UpdateMethodFormData(
  url: string,
  data: any,
  id: any,
  lang: any
) {
  let res = await api.patch(`${url}/${id}`, data, {
    headers: {
      lang: lang,
      "Content-Type": "multipart/form-data",
    },
  });
  if (res) return res.data;
  else return false;
}
export async function CreateMethodFormData(url: string, data: any, lang: any) {
  let res = await api.post(`${url}`, data, {
    headers: {
      lang: lang,
      "Content-Type": "multipart/form-data",
    },
  });
  if (res) return res;
  else return false;
}
