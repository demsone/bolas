import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";

export function MarkdownContent({ children }: { children: string }) {
  return (
    <div className="prose-hearth">
      <Markdown
        components={{
          img: ({ alt = "", src, title }) => (
            <span className="prose-media">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img alt={alt} loading="lazy" src={typeof src === "string" ? src : undefined} />
              {title && <span className="prose-media-caption">{title}</span>}
            </span>
          ),
        }}
        remarkPlugins={[remarkGfm]}
      >
        {children}
      </Markdown>
    </div>
  );
}
