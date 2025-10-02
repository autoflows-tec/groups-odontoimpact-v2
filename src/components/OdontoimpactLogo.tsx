interface OdontoimpactLogoProps {
  className?: string;
}

const OdontoimpactLogo = ({ className = "h-8 w-8" }: OdontoimpactLogoProps) => {
  return (
    <div className={`${className} relative`}>
      <img 
        src="/odontoimpact-logo.png" 
        alt="Odontoimpact" 
        className="w-full h-full object-contain"
      />
    </div>
  );
};

export default OdontoimpactLogo;