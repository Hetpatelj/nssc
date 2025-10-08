export function NsscLogo(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 200 200"
      {...props}
    >
      <defs>
        <path
          id="upperTextPath"
          d="M 40,100 A 60,60 0 1,1 160,100"
          transform="rotate(180, 100, 100)"
        />
        <path
          id="lowerTextPath"
          d="M 25,100 A 75,75 0 1,1 175,100"
        />
      </defs>

      {/* Outer Rings */}
      <circle cx="100" cy="100" r="100" fill="#262626" />
      <circle cx="100" cy="100" r="98" fill="#F9D423" />
      <circle cx="100" cy="100" r="96" fill="#262626" />

      {/* Inner Content Area */}
      <circle cx="100" cy="100" r="90" fill="#3B231A" />
      
      {/* Striped Bottom Area */}
      <clipPath id="bottomHalf">
        <rect x="0" y="100" width="200" height="100" />
      </clipPath>
      <g clipPath="url(#bottomHalf)">
        <circle cx="100" cy="100" r="90" fill="#F9D423" />
        <g stroke="#FFFFFF" strokeWidth="3.5">
          {[...Array(20)].map((_, i) => (
            <line key={i} x1="0" y1={100 + i * 4} x2="200" y2={100 + i * 4} />
          ))}
        </g>
      </g>
      
      {/* Semicircle with lines behind lamp */}
       <clipPath id="topHalfForLines">
        <rect x="0" y="0" width="200" height="100" />
      </clipPath>
      <g clipPath="url(#topHalfForLines)" transform="translate(0, 5)">
         <g stroke="#F9D423" strokeWidth="2.2">
            {[...Array(10)].map((_, i) => (
              <line key={i} x1="60" y1={98 - i * 5} x2="140" y2={98 - i * 5} />
            ))}
        </g>
      </g>

      {/* Central Graphic (Book/Base and Diya) */}
      <g fill="#F9D423" stroke="#3B231A" strokeWidth="1">
         {/* Diya (Lamp) */}
        <path d="M 85,105 A 15,5 0 1,1 115,105" fill="none" strokeWidth="1.5" />
        <path d="M 95,75 C 90,85 90,95 100,105 C 110,95 110,85 105,75 C 100,85 100,85 95,75 Z" strokeWidth="1.5"/>

        {/* Book/Base */}
        <path d="M 60,130 L 100,105 L 140,130 L 100,155 Z" strokeWidth="1.5" fill="none" strokeLinejoin="round" strokeLinecap="round" />
        <path d="M 65,128 L 100,145 L 135,128 L 100,111 Z" strokeWidth="1.5" strokeLinejoin="round" strokeLinecap="round" />
        <line x1="100" y1="111" x2="100" y2="105" strokeWidth="1.5" />
      </g>

      {/* Text */}
      <text fill="#F9D423" fontSize="18" fontWeight="bold" letterSpacing="1">
        <textPath href="#upperTextPath" startOffset="50%" textAnchor="middle">
          राष्ट्रीय कौशल्य क्षेत्र परिषद
        </textPath>
      </text>
      <text fill="#3B231A" fontSize="16" fontWeight="bold" letterSpacing="1.5">
        <textPath href="#lowerTextPath" startOffset="50%" textAnchor="middle">
          NATIONAL SKILL COUNCILS
        </textPath>
      </text>
    </svg>
  );
}
