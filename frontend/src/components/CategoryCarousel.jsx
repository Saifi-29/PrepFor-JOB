import React from 'react';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from './ui/carousel';
import { Button } from './ui/button';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { setSearchedQuery } from '@/redux/jobSlice';

const category = [
    "Frontend Developer",
    "Backend Developer",
    "Data Science",
    "Graphic Designer",
    "FullStack Developer"
];

const CategoryCarousel = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const searchJobHandler = (query) => {
        dispatch(setSearchedQuery(query));
        navigate("/browse");
    }

    return (
        <div className="py-16">
            <div className="max-w-7xl mx-auto px-4">
                <h2 className="text-3xl font-bold text-center mb-10 bg-gradient-to-r from-purple-400 to-pink-500 text-transparent bg-clip-text">
                    Popular Categories
                </h2>
                <Carousel className="w-full max-w-4xl mx-auto">
                    <CarouselContent>
                        {category.map((cat, index) => (
                            <CarouselItem key={index} className="md:basis-1/3 lg:basis-1/4">
                                <Button
                                    onClick={() => searchJobHandler(cat)}
                                    variant="outline"
                                    className="w-full py-6 px-4 rounded-xl bg-white/10 backdrop-blur-lg border-2 border-white/20 hover:bg-white/20 hover:scale-105 transition-all duration-300 text-white font-medium"
                                >
                                    {cat}
                                </Button>
                            </CarouselItem>
                        ))}
                    </CarouselContent>
                    <CarouselPrevious className="bg-white/10 border-2 border-white/20 text-white hover:bg-white/20" />
                    <CarouselNext className="bg-white/10 border-2 border-white/20 text-white hover:bg-white/20" />
                </Carousel>
            </div>
        </div>
    )
}

export default CategoryCarousel