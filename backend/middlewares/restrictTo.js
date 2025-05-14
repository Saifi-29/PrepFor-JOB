export const restrictTo = (role) => {
    return (req, res, next) => {
        if (req.role !== role) {
            return res.status(403).json({
                success: false,
                message: "You are not authorized to perform this action"
            });
        }
        next();
    };
}; 