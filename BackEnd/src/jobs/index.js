import autoCloseJob from './autoCloseJob.js'

export const initJobs = () => {
    autoCloseJob.init();
}

export {autoCloseJob}