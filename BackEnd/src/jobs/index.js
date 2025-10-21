import autoCloseJob from "./autoCloseJob.js";
import autoStatusJob from "./autoStatusJob.js";


export const initJobs = () => {
  autoCloseJob.init();
  autoStatusJob.init();
};

export { autoCloseJob };
export { autoStatusJob };
