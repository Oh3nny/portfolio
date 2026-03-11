import type { CSSProperties } from "react";

const IOS_APP_ICON_MASK_URL = "url('/icons/ios-app-icon-mask.svg')";

export const IOS_APP_ICON_MASK_STYLE: CSSProperties = {
  WebkitMaskImage: IOS_APP_ICON_MASK_URL,
  maskImage: IOS_APP_ICON_MASK_URL,
  WebkitMaskPosition: "center",
  maskPosition: "center",
  WebkitMaskRepeat: "no-repeat",
  maskRepeat: "no-repeat",
  WebkitMaskSize: "100% 100%",
  maskSize: "100% 100%",
};
