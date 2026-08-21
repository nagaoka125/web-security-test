"use client";

import type { About } from "@/app/_types/About";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faIdCard } from "@fortawesome/free-solid-svg-icons";
import { sanitizeHtml } from "@/app/_utils/sanitizeHtml";

type Props = {
  about: About;
};

export const AboutView: React.FC<Props> = (props) => {
  const { about } = props;
  const sanitizedContent = sanitizeHtml(about.aboutContent);

  return (
    <div>
      <div className="mb-2 flex flex-col gap-y-3">
        <div className="text-2xl font-bold">
          <FontAwesomeIcon icon={faIdCard} className="mr-1.5" />
          {about.userName}
        </div>

        <div
          dangerouslySetInnerHTML={{ __html: sanitizedContent }}
          className="mr-1"
        />
      </div>
    </div>
  );
};
