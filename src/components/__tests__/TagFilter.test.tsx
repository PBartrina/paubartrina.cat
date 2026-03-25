/**
 * @vitest-environment happy-dom
 */
import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import TagFilter from "@/components/TagFilter";

const mockPush = vi.fn();
const mockPathname = "/ca/blog";

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: mockPush }),
  usePathname: () => mockPathname,
}));

const allTags = ["react", "typescript"];

describe("TagFilter", () => {
  beforeEach(() => {
    mockPush.mockClear();
  });

  it("renders All button and one button per tag", () => {
    render(<TagFilter allTags={allTags} allTagsLabel="All" />);
    expect(screen.getByRole("button", { name: "All" })).toBeTruthy();
    expect(screen.getByRole("button", { name: "react" })).toBeTruthy();
    expect(screen.getByRole("button", { name: "typescript" })).toBeTruthy();
  });

  it("returns null when allTags is empty", () => {
    const { container } = render(<TagFilter allTags={[]} allTagsLabel="All" />);
    expect(container.firstChild).toBeNull();
  });

  it("navigates to ?tag=react when react button is clicked", () => {
    render(<TagFilter allTags={allTags} allTagsLabel="All" />);
    fireEvent.click(screen.getByRole("button", { name: "react" }));
    expect(mockPush).toHaveBeenCalledWith(`${mockPathname}?tag=react`);
  });

  it("deselects tag (navigates to base path) when active tag is clicked again", () => {
    render(
      <TagFilter allTags={allTags} allTagsLabel="All" selectedTag="react" />
    );
    fireEvent.click(screen.getByRole("button", { name: "react" }));
    expect(mockPush).toHaveBeenCalledWith(mockPathname);
  });

  it("navigates to base path when All button is clicked", () => {
    render(
      <TagFilter allTags={allTags} allTagsLabel="All" selectedTag="react" />
    );
    fireEvent.click(screen.getByRole("button", { name: "All" }));
    expect(mockPush).toHaveBeenCalledWith(mockPathname);
  });
});
