---
title: "In Between: Building a Physically-Based Renderer from Scratch in ETH's Computer Graphics Course"
date: 2026-07-19T12:00:00+08:00
description: The physically-based renderer I built during my exchange at ETH Zürich
tags:
  - ETH
  - Computer Graphics
  - Rendering
  - Exchange
draft: true
outline: true
tldr: While taking Computer Graphics at ETH, I built a physically-based renderer on top of the course's Nori 2 framework, adding features like heterogeneous participating media rendering, equiangular sampling, and an environment map emitter, and used it to render our final piece 'In Between' for the rendering competition.
---

This post is about the physically-based renderer I built in the Computer Graphics course during [my exchange at ETH Zürich](/en/posts/eth/).

Computer Graphics is a really well-organized course: over a single semester, starting from [Nori 2](https://graphics.ethz.ch/teaching/cg24/nori.php), the educational ray tracing framework provided by the course, students implement a complete physically-based renderer in C++ through four individual assignments and a final project. The final project is the highlight of the course: besides extending the renderer with new features, you have to use your own renderer to produce an image for the rendering competition, following the theme announced that year!

I worked on this project together with Wei Wang, a fellow student I met there. From splitting up features and modeling the scene to pulling all-nighters tweaking parameters for the final render, this piece is truly the result of both of our efforts — thank you, Wei!

## Final Piece: In Between

The competition theme that year was "In Between". I had just spent two weeks traveling around Iceland with friends, where we visited the [Seljalandsfoss](https://en.wikipedia.org/wiki/Seljalandsfoss) waterfall. The view looking out from the cave behind the waterfall felt like a great fit for the theme. Our idea was to capture the moment of stepping from the known into the unknown: the scene transitions from a cave to open plains, with the waterfall acting as a natural curtain that places the viewer at a pivotal moment of adventure; the dawn light carries the dual symbolism of darkness and light, while the mist provides a seamless transition between the two worlds. We also wanted to implement heterogeneous participating media, and a waterfall happened to be the perfect test subject (though the part I'm most proud of is actually the cloud in the top-left corner XD — that's not an environment map, it's a genuinely rendered cloud, hehe).

{{<figure src="/image/eth-cg24-final-project/final.webp" title="Final render: In Between">}}

## What We Implemented

The final project is graded by picking features to implement from a long list, and every feature needs an implementation write-up and validation (e.g., comparing renders against Mitsuba). Here's how we split the work:

**Me, Jie-Ying Lee**:

- Directional Light: parallel light source
- Henyey-Greenstein Phase Function: anisotropic phase function
- Windowed Sinc Filter: an additional image reconstruction filter
- Scene modeling: mesh modeling for the final scene
- Heterogeneous Participating Media: volumetric rendering of clouds and fog
- Equiangular Sampling: equiangular sampling for single scattering
- Environment Map Emitter: environment map light source

**Wei Wang**:

- Images as Textures: support for image texture maps
- Procedural Textures: procedural textures generated with Perlin noise
- Intel Open Image Denoise integration: denoising the rendered output
- Rendering on the Euler Cluster: moving render jobs onto ETH's compute cluster
- Stratified Sampling: variance reduction through stratification
- Disney BSDF: the principled material model widely used in industry
- Realistic Camera Model: a camera model simulating real lenses


The most time-consuming part was heterogeneous participating media: both the cloud and the waterfall mist in the final image are rendered from NanoVDB volume data, combined with equiangular sampling and the HG phase function to make light scattering inside the volumes both correct and fast to converge.

## Full Report and Slides

The full final report covers the implementation details and validation comparisons for every feature (with interactive before/after comparison sliders you can drag). If you're interested, you can read it here:

**[Computer Graphics Final Project Report](/eth-cg24/project/)**

And here are the slides we presented at the rendering competition, with highlights and renders for each feature:

**[Rendering Competition Presentation Slides (PDF)](/eth-cg24/rendering-competition-slides.pdf)**

Unfortunately, ETH doesn't allow the project source code to be made public, so I can't share it, but the report itself is fine to publish. If you're interested in the course or in applying for an exchange, you can also check out my earlier posts on [applying for the exchange](/posts/nycu-cs-eth-exchange/) (in Chinese) and [my exchange experience at ETH](/en/posts/eth/).
