import React, { memo } from 'react';
import { Typography } from 'antd';

const { Paragraph: AntParagraph } = Typography;

interface FixedParagraphProps {
  ellipsis?: boolean | { rows?: number };
  className?: string;
  style?: React.CSSProperties;
  children: React.ReactNode;
}

// Create a memoized version of the Paragraph component to prevent unnecessary re-renders
const FixedParagraph = memo(
  ({ ellipsis, children, ...props }: FixedParagraphProps) => {
    // If ellipsis is enabled, use a simpler implementation
    if (ellipsis) {
      return (
        <div
          style={{
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            display: '-webkit-box',
            WebkitLineClamp: typeof ellipsis === 'object' && ellipsis.rows ? ellipsis.rows : 2,
            WebkitBoxOrient: 'vertical',
            ...props.style,
          }}
          className={props.className}
        >
          {children}
        </div>
      );
    }

    // Otherwise use Ant Design's Paragraph without ellipsis
    return <AntParagraph {...props}>{children}</AntParagraph>;
  }
);

FixedParagraph.displayName = 'FixedParagraph';

export { FixedParagraph }; 