const SkeletonLoader = ({ type = 'card', count = 1 }) => {
  const renderCardSkeleton = () => (
    <div className="bg-white rounded-2xl overflow-hidden premium-shadow gold-border">
      <div className="aspect-square skeleton-loader" />
      <div className="p-4 space-y-3">
        <div className="h-3 w-16 skeleton-loader" />
        <div className="h-5 w-3/4 skeleton-loader" />
        <div className="h-3 w-24 skeleton-loader" />
        <div className="h-6 w-20 skeleton-loader" />
      </div>
    </div>
  );

  const renderLineSkeleton = () => (
    <div className="space-y-3">
      <div className="h-4 w-full skeleton-loader" />
      <div className="h-4 w-3/4 skeleton-loader" />
      <div className="h-4 w-1/2 skeleton-loader" />
    </div>
  );

  const renderBannerSkeleton = () => (
    <div className="w-full h-[70vh] skeleton-loader rounded-2xl" />
  );

  const renderSkeleton = () => {
    switch (type) {
      case 'card':
        return renderCardSkeleton();
      case 'line':
        return renderLineSkeleton();
      case 'banner':
        return renderBannerSkeleton();
      default:
        return renderCardSkeleton();
    }
  };

  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i}>{renderSkeleton()}</div>
      ))}
    </>
  );
};

export default SkeletonLoader;
