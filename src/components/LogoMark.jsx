export default function LogoMark({ className }) {
  return (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" width="40" height="44" viewBox="195 295 380 415" preserveAspectRatio="xMidYMid meet">
      <defs>
        <clipPath id="lm-a"><path d="M 215 315 L 551 315 L 551 685 L 215 685 Z" clipRule="nonzero"/></clipPath>
        <clipPath id="lm-b"><path d="M 198.050781 486.34375 L 413.65625 198.050781 L 701.949219 413.65625 L 486.34375 701.949219 Z" clipRule="nonzero"/></clipPath>
        <clipPath id="lm-c"><path d="M 204 304 L 562 304 L 562 696 L 204 696 Z" clipRule="nonzero"/></clipPath>
      </defs>
      <g clipPath="url(#lm-a)">
        <g clipPath="url(#lm-b)">
          <path fill="#2a4879" fillOpacity="1" fillRule="evenodd" d="M 215.597656 483.414062 L 550.773438 315.253906 L 484.195312 684.289062 L 416.855469 494.320312 Z" />
        </g>
      </g>
      <g clipPath="url(#lm-c)">
        <g clipPath="url(#lm-b)">
          <path strokeLinecap="round" transform="matrix(6.695823, -8.953273, 8.953273, 6.695823, -2824.008591, 583.545469)" fill="none" strokeLinejoin="round" d="M 169.999967 212.359946 L 200.000026 227.360125 L 169.999917 242.359925 L 179.999877 227.360068 Z" stroke="#000000" strokeWidth="2" strokeOpacity="1" strokeMiterlimit="4"/>
        </g>
      </g>
    </svg>
  );
}
