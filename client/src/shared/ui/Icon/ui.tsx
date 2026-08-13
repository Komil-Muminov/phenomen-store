import SvgComponent, { Path as SvgPath } from 'react-native-svg';

export type TIconName =
  | 'arrow-left'
  | 'arrowLeft'
  | 'chevronLeft'
  | 'chevron-left'
  | 'search'
  | 'user'
  | 'cart'
  | 'cross'
  | 'close'
  | 'check'
  | 'plus'
  | 'minus'
  | 'filter'
  | 'chevron-right'
  | 'chevronRight'
  | 'heart'
  | 'shield'
  | 'bag'
  | 'sparkles'
  | 'lock'
  | 'eye'
  | 'eye-off'
  | 'eyeoff'
  | 'phone'
  | 'chat'
  | 'zap'
  | 'gift'
  | 'clock'
  | 'trash'
  | 'edit'
  | 'package'
  | 'store'
  | 'chevron-down'
  | 'chevronDown'
  | 'chevron-up'
  | 'chevronUp'
  | 'refresh'
  | 'globe'
  | 'grid'
  | 'list';

interface IProps {
  name: TIconName | string;
  size?: number;
  color?: string;
}

export const Icon = ({ name, size = 20, color = '#171717' }: IProps) => {
  const normName = String(name).toLowerCase();

  if (normName === 'arrow-left' || normName === 'arrowleft' || normName === 'chevronleft' || normName === 'chevron-left') {
    return (
      <SvgComponent width={size} height={size} viewBox="0 0 24 24" fill="none">
        <SvgPath
          d="M19 12H5M12 19l-7-7 7-7"
          stroke={color}
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </SvgComponent>
    );
  }

  if (normName === 'search') {
    return (
      <SvgComponent width={size} height={size} viewBox="0 0 24 24" fill="none">
        <SvgPath
          d="M21 21l-4.35-4.35M19 11a8 8 0 11-16 0 8 8 0 0116 0z"
          stroke={color}
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </SvgComponent>
    );
  }

  if (normName === 'user') {
    return (
      <SvgComponent width={size} height={size} viewBox="0 0 24 24" fill="none">
        <SvgPath
          d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2M12 11a4 4 0 100-8 4 4 0 000 8z"
          stroke={color}
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </SvgComponent>
    );
  }

  if (normName === 'cart' || normName === 'bag') {
    return (
      <SvgComponent width={size} height={size} viewBox="0 0 24 24" fill="none">
        <SvgPath
          d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4H6zM3 6h18M16 10a4 4 0 01-8 0"
          stroke={color}
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </SvgComponent>
    );
  }

  if (normName === 'cross' || normName === 'close') {
    return (
      <SvgComponent width={size} height={size} viewBox="0 0 24 24" fill="none">
        <SvgPath
          d="M18 6L6 18M6 6l12 12"
          stroke={color}
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </SvgComponent>
    );
  }

  if (normName === 'check') {
    return (
      <SvgComponent width={size} height={size} viewBox="0 0 24 24" fill="none">
        <SvgPath
          d="M20 6L9 17l-5-5"
          stroke={color}
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </SvgComponent>
    );
  }

  if (normName === 'plus') {
    return (
      <SvgComponent width={size} height={size} viewBox="0 0 24 24" fill="none">
        <SvgPath
          d="M12 5v14M5 12h14"
          stroke={color}
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </SvgComponent>
    );
  }

  if (normName === 'minus') {
    return (
      <SvgComponent width={size} height={size} viewBox="0 0 24 24" fill="none">
        <SvgPath
          d="M5 12h14"
          stroke={color}
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </SvgComponent>
    );
  }

  if (normName === 'filter' || normName === 'sliders' || normName === 'sliders-horizontal') {
    return (
      <SvgComponent width={size} height={size} viewBox="0 0 24 24" fill="none">
        <SvgPath
          d="M4 21v-7M4 10V3M12 21v-9M12 8V3M20 21v-5M20 12V3M1 14h6M9 8h6M17 16h6"
          stroke={color}
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </SvgComponent>
    );
  }

  if (normName === 'chevron-right' || normName === 'chevronright') {
    return (
      <SvgComponent width={size} height={size} viewBox="0 0 24 24" fill="none">
        <SvgPath
          d="M9 18l6-6-6-6"
          stroke={color}
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </SvgComponent>
    );
  }

  if (normName === 'chevron-down' || normName === 'chevrondown') {
    return (
      <SvgComponent width={size} height={size} viewBox="0 0 24 24" fill="none">
        <SvgPath
          d="M6 9l6 6 6-6"
          stroke={color}
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </SvgComponent>
    );
  }

  if (normName === 'chevron-up' || normName === 'chevronup') {
    return (
      <SvgComponent width={size} height={size} viewBox="0 0 24 24" fill="none">
        <SvgPath
          d="M18 15l-6-6-6 6"
          stroke={color}
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </SvgComponent>
    );
  }

  if (normName === 'heart') {
    return (
      <SvgComponent width={size} height={size} viewBox="0 0 24 24" fill="none">
        <SvgPath
          d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l8.72-8.72 1.06-1.06a5.5 5.5 0 000-7.78z"
          stroke={color}
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </SvgComponent>
    );
  }

  if (normName === 'shield') {
    return (
      <SvgComponent width={size} height={size} viewBox="0 0 24 24" fill="none">
        <SvgPath
          d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"
          stroke={color}
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </SvgComponent>
    );
  }

  if (normName === 'sparkles') {
    return (
      <SvgComponent width={size} height={size} viewBox="0 0 24 24" fill="none">
        <SvgPath
          d="M12 3v3m0 12v3M3 12h3m12 0h3m-3.5-6.5l-2 2m-7 7l-2 2m11 0l-2-2m-7-7l-2-2"
          stroke={color}
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </SvgComponent>
    );
  }

  if (normName === 'grid') {
    return (
      <SvgComponent width={size} height={size} viewBox="0 0 24 24" fill="none">
        <SvgPath
          d="M10 3H3v7h7V3zm11 0h-7v7h7V3zm-11 11H3v7h7v-7zm11 0h-7v7h7v-7z"
          stroke={color}
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </SvgComponent>
    );
  }

  if (normName === 'list') {
    return (
      <SvgComponent width={size} height={size} viewBox="0 0 24 24" fill="none">
        <SvgPath
          d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01"
          stroke={color}
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </SvgComponent>
    );
  }

  if (normName === 'lock') {
    return (
      <SvgComponent width={size} height={size} viewBox="0 0 24 24" fill="none">
        <SvgPath
          d="M19 11H5a2 2 0 00-2 2v7a2 2 0 002 2h14a2 2 0 002-2v-7a2 2 0 00-2-2zM7 11V7a5 5 0 0110 0v4"
          stroke={color}
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </SvgComponent>
    );
  }

  if (normName === 'eye') {
    return (
      <SvgComponent width={size} height={size} viewBox="0 0 24 24" fill="none">
        <SvgPath
          d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"
          stroke={color}
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <SvgPath
          d="M12 15a3 3 0 100-6 3 3 0 000 6z"
          stroke={color}
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </SvgComponent>
    );
  }

  if (normName === 'eye-off' || normName === 'eyeoff') {
    return (
      <SvgComponent width={size} height={size} viewBox="0 0 24 24" fill="none">
        <SvgPath
          d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24M1 1l22 22"
          stroke={color}
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </SvgComponent>
    );
  }

  if (normName === 'chat') {
    return (
      <SvgComponent width={size} height={size} viewBox="0 0 24 24" fill="none">
        <SvgPath
          d="M21 11.5a8.38 8.38 0 01-.9 3.8 8.5 8.5 0 01-7.6 4.7 8.38 8.38 0 01-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 01-.9-3.8 8.5 8.5 0 014.7-7.6 8.38 8.38 0 013.8-.9h.5a8.48 8.48 0 018 8v.5z"
          stroke={color}
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </SvgComponent>
    );
  }

  if (normName === 'phone') {
    return (
      <SvgComponent width={size} height={size} viewBox="0 0 24 24" fill="none">
        <SvgPath
          d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72 12.84 12.84 0 00.7 2.81 2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45 12.84 12.84 0 002.81.7A2 2 0 0122 16.92z"
          stroke={color}
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </SvgComponent>
    );
  }

  if (normName === 'zap' || normName === 'lightning') {
    return (
      <SvgComponent width={size} height={size} viewBox="0 0 24 24" fill="none">
        <SvgPath
          d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"
          stroke={color}
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </SvgComponent>
    );
  }

  if (normName === 'gift') {
    return (
      <SvgComponent width={size} height={size} viewBox="0 0 24 24" fill="none">
        <SvgPath
          d="M20 12v10H4V12M2 7h20v5H2zM12 22V7M12 7H7.5a2.5 2.5 0 010-5C11 2 12 7 12 7zM12 7h4.5a2.5 2.5 0 000-5C13 2 12 7 12 7z"
          stroke={color}
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </SvgComponent>
    );
  }

  if (normName === 'clock') {
    return (
      <SvgComponent width={size} height={size} viewBox="0 0 24 24" fill="none">
        <SvgPath
          d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z"
          stroke={color}
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <SvgPath
          d="M12 6V12L16 14"
          stroke={color}
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </SvgComponent>
    );
  }

  if (normName === 'trash') {
    return (
      <SvgComponent width={size} height={size} viewBox="0 0 24 24" fill="none">
        <SvgPath
          d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"
          stroke={color}
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </SvgComponent>
    );
  }

  if (normName === 'edit') {
    return (
      <SvgComponent width={size} height={size} viewBox="0 0 24 24" fill="none">
        <SvgPath
          d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"
          stroke={color}
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </SvgComponent>
    );
  }

  if (normName === 'package' || normName === 'box') {
    return (
      <SvgComponent width={size} height={size} viewBox="0 0 24 24" fill="none">
        <SvgPath
          d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z"
          stroke={color}
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <SvgPath
          d="M3.27 6.96L12 12.01l8.73-5.05M12 22.08V12"
          stroke={color}
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </SvgComponent>
    );
  }

  if (normName === 'store') {
    return (
      <SvgComponent width={size} height={size} viewBox="0 0 24 24" fill="none">
        <SvgPath
          d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
          stroke={color}
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <SvgPath
          d="M9 22V12h6v10"
          stroke={color}
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </SvgComponent>
    );
  }

  if (normName === 'refresh') {
    return (
      <SvgComponent width={size} height={size} viewBox="0 0 24 24" fill="none">
        <SvgPath
          d="M23 4v6h-6M1 20v-6h6M3.51 9a9 9 0 0114.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0020.49 15"
          stroke={color}
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </SvgComponent>
    );
  }

  if (normName === 'globe') {
    return (
      <SvgComponent width={size} height={size} viewBox="0 0 24 24" fill="none">
        <SvgPath
          d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z"
          stroke={color}
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <SvgPath
          d="M2 12h20M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z"
          stroke={color}
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </SvgComponent>
    );
  }

  return (
    <SvgComponent width={size} height={size} viewBox="0 0 24 24" fill="none">
      <SvgPath
        d="M12 3v3m0 12v3M3 12h3m12 0h3m-3.5-6.5l-2 2m-7 7l-2 2m11 0l-2-2m-7-7l-2-2"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </SvgComponent>
  );
};

