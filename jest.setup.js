// 导入jest-dom扩展，添加custom matchers
import "@testing-library/jest-dom";

// 模拟Next.js的Link和Image组件等
jest.mock("next/link", () => {
  const MockedLink = ({ children, href }) => {
    return <a href={href}>{children}</a>;
  };
  MockedLink.displayName = "MockedLink";
  return MockedLink;
});

jest.mock("next/image", () => {
  const MockedImage = (props) => {
    return <img {...props} />;
  };
  MockedImage.displayName = "MockedImage";
  return { __esModule: true, default: MockedImage };
});
