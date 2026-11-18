type BrandLogoProps = {
  size?: 'header' | 'footer';
};

export function BrandLogo({ size = 'header' }: BrandLogoProps) {
  const isHeader = size === 'header';

  return (
    <span className="inline-flex items-center gap-2.5">
      <img
        src={`${import.meta.env.BASE_URL}yurdum-mark.svg`}
        alt=""
        aria-hidden="true"
        className={isHeader ? 'h-10 w-10 md:h-11 md:w-11' : 'h-10 w-10'}
      />
      <span className={`font-semibold tracking-[-0.045em] text-white ${isHeader ? 'text-[17px] md:text-lg' : 'text-xl'}`}>
        Yurdum
      </span>
    </span>
  );
}
