/* eslint-disable no-plusplus */
/* eslint-disable default-param-last */
/* eslint-disable @typescript-eslint/no-explicit-any */
// import { QueryParams } from "@/interfaces/query-params";
import config from "./app-config";
import { toast } from "react-toastify";
// import { AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime";

export const saveLocalStorage = (data: any, key: string) => {
  try {
    const jsonData = JSON.stringify(data);
    localStorage.setItem(key, jsonData);
    return true;
  } catch (error: any) {
    toast.error(error?.message || "An error occurred while saving data.");
    return false;
  }
};

export const getLocalStorage = (key: string) => {
  try {
    const jsonData = localStorage.getItem(key);
    if (!jsonData) return null;
    return JSON.parse(jsonData);
  } catch (error: any) {
    toast.error(error?.message || "An error occurred while getting data.");
    return null;
  }
};

export const clearLocalStorage = (key: string) => {
  try {
    localStorage.removeItem(key);
  } catch (error: any) {
    toast.error(error?.message || "An error occurred while clearing data.");
    return null;
  }
  return null;
};

export const checkToken = () => {
  const token = getLocalStorage(config.tokenKey);

  return !!token;
};

export const checkRoles = () => {
  const token = getLocalStorage(config.tokenKey);
  return token?.roles;
};

export const getQueryKeys = (namespace: string) => ({
  create: `${namespace}/create`,
  read: `${namespace}/read`,
  readOne: `${namespace}/readOne`,
  update: `${namespace}/update`,
  patch: `${namespace}/patch`,
  put: `${namespace}/put`,
  delete: `${namespace}/delete`,
});

export function handleErrors(err: any) {
  const { response, message } = err;
  const { data } = response || {};
  if (message) return message;
  if (data) {
    if (data.message) return data.message;
    if (data.errors) {
      if (typeof data.errors === "string") return data.errors;
      if (Array.isArray(data.errors)) return data.errors[0];
    }
  }
  if (err.errors) {
    const firstError = Object.values(err.errors)[0];
    if (firstError) return firstError;
  }

  return "An Error Occurred. Please try again";
}

export const formatFormData = (values: any[]) => {
  const formData = new FormData();
  const imageKeys: string[] = [];
  const arrayKeys: string[] = [];
  const arr = Object.keys(values);
  arr.forEach((el: any) => {
    if (imageKeys.includes(el)) {
      for (let i = 0; i < values[el].length; i++) {
        formData.append(el, values[el][i]);
      }
    } else if (arrayKeys.includes(el)) {
      for (let j = 0; j < values[el].length; j++) {
        formData.append(`${el}[]`, values[el][j]);
      }
    } else {
      formData.append(el, values[el]);
    }
  });
  return formData;
};

export const formatDate = (date: string) => {
  return Math.floor(Date.parse(date) / 1000).toString();
};

export const parseDate = (timestamp: string) => {
  const date = new Date(parseInt(timestamp, 10) * 1000);
  return !isNaN(date.getTime())
    ? date.toISOString().split("T")[0].split("-").reverse().join("-")
    : "";
};

export const parseTime = (timestamp: string) => {
  const date = new Date(parseInt(timestamp, 10) * 1000);
  return !isNaN(date.getTime())
    ? date.toISOString().split("T")[1].split(".")[0] // Extracts the time part and removes milliseconds
    : "";
};

export const parseDateTime = (timestamp: string): string => {
  const milliseconds = parseInt(timestamp, 10) * 1000; // Convert to milliseconds
  const date = new Date(milliseconds);
  if (date.toString() === "Invalid Date") return "";

  // Format the date and time
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0"); // Months are 0-based
  const day = String(date.getDate()).padStart(2, "0");
  const hours = String(date.getHours() % 12 || 12).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  const ampm = date.getHours() >= 12 ? "PM" : "AM";

  return `${day}-${month}-${year}  ${hours}:${minutes} ${ampm}`;
};

export const parseDateTime2 = (timestamp: string): string => {
  const milliseconds = parseInt(timestamp, 10) * 1000; // Convert to milliseconds
  const date = new Date(milliseconds);
  if (date.toString() === "Invalid Date") return "";

  // Format the date and time
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0"); // Months are 0-based
  const day = String(date.getDate()).padStart(2, "0");
  // const hours = String(date.getHours()).padStart(2, "0");
  // const minutes = String(date.getMinutes()).padStart(2, "0");
  // const seconds = String(date.getSeconds()).padStart(2, "0");

  // return `${day}-${month}-${year} ${hours}:${minutes}`;
  return `${year}-${month}-${day}`;
};

// export const buildQueryString = (params: QueryParams): string => {
//   const query = Object.entries(params)
//     .filter(([, value]) => value !== undefined)
//     .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(value)}`)
//     .join('&');

//   return query ? `?${query}` : '';
// };

export const formatDateFromTimestamp = (unixTimestamp: string) => {
  if (!unixTimestamp) return "NA";
  const date = new Date(parseFloat(unixTimestamp) * 1000);

  const monthNames = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  const day = date.getDate();
  const month = monthNames[date.getMonth()];
  const year = date.getFullYear();

  function getOrdinalSuffix(day: number) {
    if (day > 3 && day < 21) return "th";
    switch (day % 10) {
      case 1:
        return "st";
      case 2:
        return "nd";
      case 3:
        return "rd";
      default:
        return "th";
    }
  }

  const dayWithSuffix = day + getOrdinalSuffix(day);

  return `${dayWithSuffix} ${month}, ${year}`;
};

export const pluralize = (word: string, no: number = 0) => {
  if (no === 0 || no > 1) return `${word}s`;
  return word;
};


export function formatNumberWithCommas(number: number) {
  return number.toLocaleString();
}

export const convertEnumToDropdownItem = (
  enumObject: Record<string, string | number>
) => {
  const items = Object.entries(enumObject)
    .filter(([, value]) => typeof value === "number")
    .map(([key, value]) => ({
      name: camelCaseToSpaceSeparated(key),
      id: value.toString(),
    }));
  return items;
};

export function removePathSegment(
  pathname: string,
  segmentToRemove: string
): string {
  return pathname.replace(segmentToRemove, "");
}

export function convertTo12HourFormat(time: string) {
  const [hour, minute] = time.split(":");

  // Convert hour to a number to determine AM or PM
  let hourNumber = parseInt(hour, 10);
  const isPM = hourNumber >= 12;

  // Adjust hour to 12-hour format
  hourNumber = hourNumber % 12 || 12; // Convert 0 to 12 for midnight

  // Format the hour and minute
  const formattedTime = `${hourNumber}:${minute} ${isPM ? "PM" : "AM"}`;

  return formattedTime;
}

export const camelCaseToSpaceSeparated = (str: string) => {
  return (
    str
      // Insert a space before all capital letters
      .replace(/([A-Z])/g, " $1")
      // Remove the leading space if it exists
      .replace(/^ /, "")
  );
};

export const formatUnixTimestamp = (timestamp: number | string): string => {
  const date = new Date(Number(timestamp) * 1000); // Convert to milliseconds
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const year = date.getFullYear();
  return `${month}-${day}-${year}`;
};

export const convertTimeToEpoch = (timeStr: string): number => {
  const [hours, minutes] = timeStr.split(":").map(Number);
  const now = new Date();
  now.setHours(hours, minutes, 0, 0);
  return now.getTime() / 1000;
};
export const clearErrors = (
  setErrors: (error: any) => void,
  errors: any,
  name: any
) => {
  if (errors[name]) {
    setErrors((prev: any) => ({
      ...prev,
      [name]: null,
    }));
  }
};

export const stripHtmlTags = (html: string) => {
  const strippedText = html.replace(/<[^>]*>/g, "").trim();
  return strippedText.length === 0 ? "" : html;
};

export function formatDateTime(datetimeLocal: string) {
  // Convert datetime-local string to a Date object
  const date = new Date(datetimeLocal);

  // Get the epoch time (milliseconds since January 1, 1970)
  const epochTime = date.getTime() / 1000; // Convert to seconds
  return Math.floor(epochTime); // Return as integer (optional)
}

export function parseDateTimeLocal(epochTime: number) {
  const date = new Date(epochTime * 1000);

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");

  return `${year}-${month}-${day}T${hours}:${minutes}`;
}
export const getDateRangeText = (filter: number) => {
  const today = new Date();
  let startDate;

  switch (filter) {
    case 1: // Last 30 days
      startDate = new Date(today);
      startDate.setDate(today.getDate() - 30);
      return `${startDate.toLocaleString("default", {
        month: "long",
      })} ${startDate.getDate()} till date`;
    case 2: // This Quarter
      const quarterStartMonth = Math.floor(today.getMonth() / 3) * 3;
      startDate = new Date(today.getFullYear(), quarterStartMonth, 1);
      return `${startDate.toLocaleString("default", {
        month: "long",
      })} ${startDate.getDate()} till date`;
    case 3: // This Year
      startDate = new Date(today.getFullYear(), 0, 1);
      return `${startDate.toLocaleString("default", {
        month: "long",
      })} ${startDate.getDate()} till date`;
    default: // All
      return "January 2024 till date";
  }
};

export const downloadBase64File = (base64Data: string, fileName: string) => {
  // Check if the Base64 data has a prefix (e.g., data:application/pdf;base64,...)
  const [prefix, base64String] = base64Data.includes(";base64,")
    ? base64Data.split(";base64,")
    : ["", base64Data];

  // Convert Base64 string to binary data
  const binaryData = atob(base64String); // Decode Base64 to binary
  const byteNumbers = new Uint8Array(binaryData.length);

  for (let i = 0; i < binaryData.length; i++) {
    byteNumbers[i] = binaryData.charCodeAt(i);
  }

  // Create a Blob from the binary data
  const fileType = prefix.split(":")[1] || ""; // Extract MIME type from the prefix
  const blob = new Blob([byteNumbers], { type: fileType });

  // Create a temporary anchor element to trigger the download
  const anchor = document?.createElement("a");
  anchor.href = URL.createObjectURL(blob);
  anchor.download = fileName;

  // Append the anchor to the document and trigger the download
  document?.body.appendChild(anchor);
  anchor.click();

  // Clean up
  document?.body.removeChild(anchor);
  URL.revokeObjectURL(anchor.href);
};

export function getStatusColor(status: string): string {
  switch (status.toLowerCase()) {
    case "pending":
      return "#FBBF24"; // yellow
    case "ongoing":
       case "updated":
      return "#3B82F6"; // blue
    case "convicted":
       case "new":
      return "#10B981"; // green
    case "expired":
      return "#EF4444"; // red
    default:
      return "#9CA3AF"; // gray for unknown status
  }
}