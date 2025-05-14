import React from 'react'
import LatestJobCards from './LatestJobCards';
import { useSelector } from 'react-redux';

const LatestJobs = () => {
    const { allJobs } = useSelector(store => store.job);

    return (
        <div className='py-20 bg-gradient-to-b from-white/5 to-transparent'>
            <div className='max-w-7xl mx-auto px-4'>
                <h1 className='text-4xl font-bold text-center mb-12'>
                    <span className='bg-gradient-to-r from-yellow-400 to-orange-500 text-transparent bg-clip-text'>Latest & Top </span>
                    <span className='bg-gradient-to-r from-purple-400 to-pink-500 text-transparent bg-clip-text'>Job Openings</span>
                </h1>
                <div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8'>
                    {allJobs.length <= 0 ? (
                        <div className="col-span-full text-center">
                            <div className="inline-block bg-white/10 backdrop-blur-lg rounded-xl px-6 py-4 border-2 border-white/20">
                                <p className="text-xl text-white/80">No Jobs Available</p>
                            </div>
                        </div>
                    ) : (
                        allJobs?.slice(0, 6).map((job) => (
                            <LatestJobCards key={job._id} job={job} />
                        ))
                    )}
                </div>
            </div>
        </div>
    )
}

export default LatestJobs;
