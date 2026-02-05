/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React, {type ReactNode} from 'react';
import {useLayoutDocsSidebar} from '@docusaurus/plugin-content-docs/client';
import DefaultNavbarItem from '@theme/NavbarItem/DefaultNavbarItem';
import type {Props} from '@theme/NavbarItem/DocSidebarNavbarItem';

// First link can be category index (/docs/category/supervaizer-controller) or doc (/docs/supervaize-studio/intro).
// Return the section base path(s) to match: category index and/or doc prefix so only one nav item is active.
function getSectionPaths(path: string): {categoryPath?: string; docPath?: string} {
  const normalized = path.startsWith('/') ? path : `/${path}`;
  const segments = normalized.split('/').filter(Boolean);
  if (segments.length >= 3 && segments[1] === 'category') {
    const slug = segments[2];
    return {
      categoryPath: `/${segments[0]}/${segments[1]}/${slug}`,
      docPath: `/${segments[0]}/${slug}`,
    };
  }
  if (segments.length >= 2) {
    return { docPath: `/${segments[0]}/${segments[1]}` };
  }
  return { docPath: normalized };
}

function pathMatchesSection(
  pathname: string,
  paths: { categoryPath?: string; docPath?: string }
): boolean {
  const p = pathname.startsWith('/') ? pathname : `/${pathname}`;
  const match = (b: string) => p === b || p.startsWith(`${b}/`);
  return (
    (paths.categoryPath != null && match(paths.categoryPath)) ||
    (paths.docPath != null && match(paths.docPath)) ||
    false
  );
}

export default function DocSidebarNavbarItem({
  sidebarId,
  label,
  docsPluginId,
  ...props
}: Props): ReactNode {
  const sidebarLink = useLayoutDocsSidebar(sidebarId, docsPluginId).link;
  if (!sidebarLink) {
    throw new Error(
      `DocSidebarNavbarItem: Sidebar with ID "${sidebarId}" doesn't have anything to be linked to.`,
    );
  }
  const sectionPaths = getSectionPaths(sidebarLink.path);

  // Use location from NavLink's isActive callback to ensure we always check current location
  const isActive = (_match: unknown, location: {pathname: string} | null) => {
    if (!location) return false;
    return pathMatchesSection(location.pathname, sectionPaths);
  };
  
  return (
    <DefaultNavbarItem
      {...props}
      isActive={isActive}
      label={label ?? sidebarLink.label}
      to={sidebarLink.path}
    />
  );
}
