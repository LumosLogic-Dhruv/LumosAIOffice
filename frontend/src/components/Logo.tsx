interface LogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  onDark?: boolean;
}

const Logo = ({ size = 'md', onDark = false }: LogoProps) => {
  const imgSize = { sm: 'h-6', md: 'h-8', lg: 'h-10', xl: 'h-12' }[size];
  const textSize = { sm: 'text-sm', md: 'text-lg', lg: 'text-xl', xl: 'text-2xl' }[size];

  return (
    <div className="flex items-center gap-2.5">
      <img
        src="/Favicon.svg"
        alt="DocuFlow AI"
        className={imgSize}
        style={onDark ? { filter: 'brightness(0) invert(1)' } : {}}
      />
      <span className={`font-black tracking-tight ${textSize} ${onDark ? 'text-white' : 'text-gray-900'}`}>
        DocuFlow{' '}
        <span style={onDark ? { color: 'rgba(255,255,255,0.75)' } : { color: '#714B67' }}>AI</span>
      </span>
    </div>
  );
};

export default Logo;
