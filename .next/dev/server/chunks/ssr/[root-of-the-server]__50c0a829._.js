module.exports = [
"[externals]/next/dist/shared/lib/no-fallback-error.external.js [external] (next/dist/shared/lib/no-fallback-error.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/shared/lib/no-fallback-error.external.js", () => require("next/dist/shared/lib/no-fallback-error.external.js"));

module.exports = mod;
}),
"[project]/Desktop/Jo's stash/aj247-site/website/app/layout.tsx [app-rsc] (ecmascript, Next.js Server Component)", ((__turbopack_context__) => {

__turbopack_context__.n(__turbopack_context__.i("[project]/Desktop/Jo's stash/aj247-site/website/app/layout.tsx [app-rsc] (ecmascript)"));
}),
"[project]/Desktop/Jo's stash/aj247-site/website/lib/supabaseClient.ts [app-rsc] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "supabase",
    ()=>supabase
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$Jo$27$s__stash$2f$aj247$2d$site$2f$website$2f$node_modules$2f40$supabase$2f$supabase$2d$js$2f$dist$2f$esm$2f$wrapper$2e$mjs__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Desktop/Jo's stash/aj247-site/website/node_modules/@supabase/supabase-js/dist/esm/wrapper.mjs [app-rsc] (ecmascript)");
;
const supabaseUrl = ("TURBOPACK compile-time value", "https://your-project.supabase.co");
const supabaseAnonKey = ("TURBOPACK compile-time value", "your-anon-key-here");
const supabase = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$Jo$27$s__stash$2f$aj247$2d$site$2f$website$2f$node_modules$2f40$supabase$2f$supabase$2d$js$2f$dist$2f$esm$2f$wrapper$2e$mjs__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["createClient"])(supabaseUrl, supabaseAnonKey);
}),
"[project]/Desktop/Jo's stash/aj247-site/website/lib/api.ts [app-rsc] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "fetchPortfolioMedia",
    ()=>fetchPortfolioMedia,
    "uploadMediaFile",
    ()=>uploadMediaFile
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$Jo$27$s__stash$2f$aj247$2d$site$2f$website$2f$lib$2f$supabaseClient$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Desktop/Jo's stash/aj247-site/website/lib/supabaseClient.ts [app-rsc] (ecmascript)");
;
async function fetchPortfolioMedia() {
    const { data, error } = await __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$Jo$27$s__stash$2f$aj247$2d$site$2f$website$2f$lib$2f$supabaseClient$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["supabase"].from("media").select("*").order("created_at", {
        ascending: false
    });
    if (error) {
        console.error("Error fetching media:", error);
        return [];
    }
    return data;
}
async function uploadMediaFile(file, metadata) {
    try {
        const fileExt = file.name.split(".").pop();
        const fileName = `${Date.now()}.${fileExt}`;
        const filePath = `${fileName}`;
        const { data: uploadData, error: uploadError } = await __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$Jo$27$s__stash$2f$aj247$2d$site$2f$website$2f$lib$2f$supabaseClient$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["supabase"].storage.from("portfolio").upload(filePath, file);
        if (uploadError) {
            return {
                success: false,
                error: uploadError.message
            };
        }
        const { data: publicUrlData } = __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$Jo$27$s__stash$2f$aj247$2d$site$2f$website$2f$lib$2f$supabaseClient$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["supabase"].storage.from("portfolio").getPublicUrl(filePath);
        const { data: insertData, error: insertError } = await __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$Jo$27$s__stash$2f$aj247$2d$site$2f$website$2f$lib$2f$supabaseClient$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["supabase"].from("media").insert([
            {
                filename: fileName,
                url: publicUrlData.publicUrl,
                title: metadata.title || null,
                description: metadata.description || null,
                youtube_id: metadata.youtube_id || null,
                uploaded_by: metadata.uploaded_by || null
            }
        ]).select().single();
        if (insertError) {
            return {
                success: false,
                error: insertError.message
            };
        }
        return {
            success: true,
            media: insertData
        };
    } catch (error) {
        return {
            success: false,
            error: error instanceof Error ? error.message : "Unknown error"
        };
    }
}
}),
"[project]/Desktop/Jo's stash/aj247-site/website/components/ImagePreview.tsx [app-rsc] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>ImagePreview
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$Jo$27$s__stash$2f$aj247$2d$site$2f$website$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Desktop/Jo's stash/aj247-site/website/node_modules/next/dist/server/route-modules/app-page/vendored/rsc/react-jsx-dev-runtime.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$Jo$27$s__stash$2f$aj247$2d$site$2f$website$2f$node_modules$2f$next$2f$image$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Desktop/Jo's stash/aj247-site/website/node_modules/next/image.js [app-rsc] (ecmascript)");
;
;
function ImagePreview({ src, alt }) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$Jo$27$s__stash$2f$aj247$2d$site$2f$website$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "relative w-full aspect-video bg-gray-100 dark:bg-gray-900",
        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$Jo$27$s__stash$2f$aj247$2d$site$2f$website$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$Jo$27$s__stash$2f$aj247$2d$site$2f$website$2f$node_modules$2f$next$2f$image$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["default"], {
            src: src,
            alt: alt,
            fill: true,
            className: "object-cover",
            sizes: "(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        }, void 0, false, {
            fileName: "[project]/Desktop/Jo's stash/aj247-site/website/components/ImagePreview.tsx",
            lineNumber: 11,
            columnNumber: 7
        }, this)
    }, void 0, false, {
        fileName: "[project]/Desktop/Jo's stash/aj247-site/website/components/ImagePreview.tsx",
        lineNumber: 10,
        columnNumber: 5
    }, this);
}
}),
"[project]/Desktop/Jo's stash/aj247-site/website/components/YouTubeEmbed.tsx [app-rsc] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>YouTubeEmbed
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$Jo$27$s__stash$2f$aj247$2d$site$2f$website$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Desktop/Jo's stash/aj247-site/website/node_modules/next/dist/server/route-modules/app-page/vendored/rsc/react-jsx-dev-runtime.js [app-rsc] (ecmascript)");
;
function YouTubeEmbed({ videoId }) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$Jo$27$s__stash$2f$aj247$2d$site$2f$website$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "relative w-full aspect-video bg-gray-100 dark:bg-gray-900",
        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$Jo$27$s__stash$2f$aj247$2d$site$2f$website$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("iframe", {
            src: `https://www.youtube.com/embed/${videoId}`,
            title: "YouTube video player",
            allow: "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture",
            allowFullScreen: true,
            className: "absolute inset-0 w-full h-full"
        }, void 0, false, {
            fileName: "[project]/Desktop/Jo's stash/aj247-site/website/components/YouTubeEmbed.tsx",
            lineNumber: 8,
            columnNumber: 7
        }, this)
    }, void 0, false, {
        fileName: "[project]/Desktop/Jo's stash/aj247-site/website/components/YouTubeEmbed.tsx",
        lineNumber: 7,
        columnNumber: 5
    }, this);
}
}),
"[project]/Desktop/Jo's stash/aj247-site/website/components/PortfolioCard.tsx [app-rsc] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>PortfolioCard
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$Jo$27$s__stash$2f$aj247$2d$site$2f$website$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Desktop/Jo's stash/aj247-site/website/node_modules/next/dist/server/route-modules/app-page/vendored/rsc/react-jsx-dev-runtime.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$Jo$27$s__stash$2f$aj247$2d$site$2f$website$2f$components$2f$ImagePreview$2e$tsx__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Desktop/Jo's stash/aj247-site/website/components/ImagePreview.tsx [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$Jo$27$s__stash$2f$aj247$2d$site$2f$website$2f$components$2f$YouTubeEmbed$2e$tsx__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Desktop/Jo's stash/aj247-site/website/components/YouTubeEmbed.tsx [app-rsc] (ecmascript)");
;
;
;
function PortfolioCard({ media }) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$Jo$27$s__stash$2f$aj247$2d$site$2f$website$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "border border-gray-200 dark:border-gray-800 rounded-lg overflow-hidden hover:shadow-lg transition-shadow",
        children: [
            media.youtube_id ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$Jo$27$s__stash$2f$aj247$2d$site$2f$website$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$Jo$27$s__stash$2f$aj247$2d$site$2f$website$2f$components$2f$YouTubeEmbed$2e$tsx__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["default"], {
                videoId: media.youtube_id
            }, void 0, false, {
                fileName: "[project]/Desktop/Jo's stash/aj247-site/website/components/PortfolioCard.tsx",
                lineNumber: 13,
                columnNumber: 9
            }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$Jo$27$s__stash$2f$aj247$2d$site$2f$website$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$Jo$27$s__stash$2f$aj247$2d$site$2f$website$2f$components$2f$ImagePreview$2e$tsx__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["default"], {
                src: media.url,
                alt: media.title || media.filename
            }, void 0, false, {
                fileName: "[project]/Desktop/Jo's stash/aj247-site/website/components/PortfolioCard.tsx",
                lineNumber: 15,
                columnNumber: 9
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$Jo$27$s__stash$2f$aj247$2d$site$2f$website$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "p-4",
                children: [
                    media.title && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$Jo$27$s__stash$2f$aj247$2d$site$2f$website$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                        className: "font-semibold text-lg mb-2",
                        children: media.title
                    }, void 0, false, {
                        fileName: "[project]/Desktop/Jo's stash/aj247-site/website/components/PortfolioCard.tsx",
                        lineNumber: 19,
                        columnNumber: 11
                    }, this),
                    media.description && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$Jo$27$s__stash$2f$aj247$2d$site$2f$website$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                        className: "text-gray-600 dark:text-gray-400 text-sm",
                        children: media.description
                    }, void 0, false, {
                        fileName: "[project]/Desktop/Jo's stash/aj247-site/website/components/PortfolioCard.tsx",
                        lineNumber: 22,
                        columnNumber: 11
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/Desktop/Jo's stash/aj247-site/website/components/PortfolioCard.tsx",
                lineNumber: 17,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/Desktop/Jo's stash/aj247-site/website/components/PortfolioCard.tsx",
        lineNumber: 11,
        columnNumber: 5
    }, this);
}
}),
"[project]/Desktop/Jo's stash/aj247-site/website/components/PortfolioGrid.tsx [app-rsc] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>PortfolioGrid
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$Jo$27$s__stash$2f$aj247$2d$site$2f$website$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Desktop/Jo's stash/aj247-site/website/node_modules/next/dist/server/route-modules/app-page/vendored/rsc/react-jsx-dev-runtime.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$Jo$27$s__stash$2f$aj247$2d$site$2f$website$2f$components$2f$PortfolioCard$2e$tsx__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Desktop/Jo's stash/aj247-site/website/components/PortfolioCard.tsx [app-rsc] (ecmascript)");
;
;
function PortfolioGrid({ media }) {
    if (media.length === 0) {
        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$Jo$27$s__stash$2f$aj247$2d$site$2f$website$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "max-w-7xl mx-auto px-4 py-12 text-center text-gray-600 dark:text-gray-400",
            children: "No portfolio items yet. Check back soon!"
        }, void 0, false, {
            fileName: "[project]/Desktop/Jo's stash/aj247-site/website/components/PortfolioGrid.tsx",
            lineNumber: 11,
            columnNumber: 7
        }, this);
    }
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$Jo$27$s__stash$2f$aj247$2d$site$2f$website$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "max-w-7xl mx-auto px-4 py-12",
        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$Jo$27$s__stash$2f$aj247$2d$site$2f$website$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6",
            children: media.map((item)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$Jo$27$s__stash$2f$aj247$2d$site$2f$website$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$Jo$27$s__stash$2f$aj247$2d$site$2f$website$2f$components$2f$PortfolioCard$2e$tsx__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["default"], {
                    media: item
                }, item.id, false, {
                    fileName: "[project]/Desktop/Jo's stash/aj247-site/website/components/PortfolioGrid.tsx",
                    lineNumber: 21,
                    columnNumber: 11
                }, this))
        }, void 0, false, {
            fileName: "[project]/Desktop/Jo's stash/aj247-site/website/components/PortfolioGrid.tsx",
            lineNumber: 19,
            columnNumber: 7
        }, this)
    }, void 0, false, {
        fileName: "[project]/Desktop/Jo's stash/aj247-site/website/components/PortfolioGrid.tsx",
        lineNumber: 18,
        columnNumber: 5
    }, this);
}
}),
"[project]/Desktop/Jo's stash/aj247-site/website/app/portfolio/page.tsx [app-rsc] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>PortfolioPage,
    "revalidate",
    ()=>revalidate
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$Jo$27$s__stash$2f$aj247$2d$site$2f$website$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Desktop/Jo's stash/aj247-site/website/node_modules/next/dist/server/route-modules/app-page/vendored/rsc/react-jsx-dev-runtime.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$Jo$27$s__stash$2f$aj247$2d$site$2f$website$2f$lib$2f$api$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Desktop/Jo's stash/aj247-site/website/lib/api.ts [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$Jo$27$s__stash$2f$aj247$2d$site$2f$website$2f$components$2f$PortfolioGrid$2e$tsx__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Desktop/Jo's stash/aj247-site/website/components/PortfolioGrid.tsx [app-rsc] (ecmascript)");
;
;
;
const revalidate = 60; // Revalidate every 60 seconds
async function PortfolioPage() {
    const media = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$Jo$27$s__stash$2f$aj247$2d$site$2f$website$2f$lib$2f$api$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["fetchPortfolioMedia"])();
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$Jo$27$s__stash$2f$aj247$2d$site$2f$website$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "py-12",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$Jo$27$s__stash$2f$aj247$2d$site$2f$website$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "max-w-7xl mx-auto px-4 mb-8",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$Jo$27$s__stash$2f$aj247$2d$site$2f$website$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("h1", {
                        className: "text-4xl font-bold mb-4",
                        children: "Our Portfolio"
                    }, void 0, false, {
                        fileName: "[project]/Desktop/Jo's stash/aj247-site/website/app/portfolio/page.tsx",
                        lineNumber: 12,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$Jo$27$s__stash$2f$aj247$2d$site$2f$website$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                        className: "text-gray-600 dark:text-gray-400",
                        children: "Explore our latest work and creative projects."
                    }, void 0, false, {
                        fileName: "[project]/Desktop/Jo's stash/aj247-site/website/app/portfolio/page.tsx",
                        lineNumber: 13,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/Desktop/Jo's stash/aj247-site/website/app/portfolio/page.tsx",
                lineNumber: 11,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$Jo$27$s__stash$2f$aj247$2d$site$2f$website$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$Jo$27$s__stash$2f$aj247$2d$site$2f$website$2f$components$2f$PortfolioGrid$2e$tsx__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["default"], {
                media: media
            }, void 0, false, {
                fileName: "[project]/Desktop/Jo's stash/aj247-site/website/app/portfolio/page.tsx",
                lineNumber: 17,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/Desktop/Jo's stash/aj247-site/website/app/portfolio/page.tsx",
        lineNumber: 10,
        columnNumber: 5
    }, this);
}
}),
"[project]/Desktop/Jo's stash/aj247-site/website/app/portfolio/page.tsx [app-rsc] (ecmascript, Next.js Server Component)", ((__turbopack_context__) => {

__turbopack_context__.n(__turbopack_context__.i("[project]/Desktop/Jo's stash/aj247-site/website/app/portfolio/page.tsx [app-rsc] (ecmascript)"));
}),
];

//# sourceMappingURL=%5Broot-of-the-server%5D__50c0a829._.js.map