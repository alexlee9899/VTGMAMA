"use client";

import React from "react";
import Image from "next/image";

// 假数据：公司团队成员
const teamMembers = [
  {
    id: 1,
    name: "Sarah Johnson",
    position: "CEO & Founder",
    bio: "Sarah founded our company in 2015 with a vision to create innovative products that enhance everyday life. With over 15 years of experience in retail and e-commerce, she leads our global strategy and operations.",
    image: "/logo.png",
  },
  {
    id: 2,
    name: "Michael Chen",
    position: "Chief Technology Officer",
    bio: "Michael oversees all technical aspects of our platform. With a background in computer science and 10+ years in software development, he ensures our website provides a seamless shopping experience.",
    image: "/logo.png",
  },
  {
    id: 3,
    name: "Emma Rodriguez",
    position: "Head of Product Design",
    bio: "Emma brings creativity and user-focused design to our product line. Her background in industrial design helps us create products that are both beautiful and functional.",
    image: "/logo.png",
  },
  {
    id: 4,
    name: "David Williams",
    position: "Customer Experience Director",
    bio: "David leads our customer service team with a passion for creating exceptional shopping experiences. He ensures that our customers receive prompt and helpful support at every touchpoint.",
    image: "/logo.png",
  },
];

// 公司历史事件
const companyHistory = [
  {
    year: 2015,
    title: "Company Founded",
    description:
      "Our journey began in a small office with just 3 team members and a vision to revolutionize online shopping.",
  },
  {
    year: 2017,
    title: "First Major Product Launch",
    description:
      "We introduced our flagship product line, which quickly gained popularity and established our brand in the market.",
  },
  {
    year: 2019,
    title: "International Expansion",
    description:
      "We expanded our operations to Europe and Asia, bringing our products to customers around the world.",
  },
  {
    year: 2020,
    title: "Sustainability Initiative",
    description:
      "We launched our eco-friendly product line and committed to reducing our carbon footprint across all operations.",
  },
  {
    year: 2022,
    title: "Innovation Award",
    description:
      "Our dedication to quality and innovation was recognized with the prestigious Industry Innovation Award.",
  },
  {
    year: 2023,
    title: "Community Giving Program",
    description:
      "We established our foundation to give back to communities through education and environmental initiatives.",
  },
];

export default function AboutPage() {
  return (
    <div className="container mx-auto px-4 py-8 bg-page-bg-primary min-h-screen">
      <section className="mb-16">
        <h1 className="text-3xl font-bold mb-8 text-center">
          About Our Company
        </h1>

        <div className="max-w-3xl mx-auto mb-12">
          <p className="text-lg mb-4">
            Welcome to our online shop, where quality meets convenience. Since
            our founding in 2015, we&apos;ve been dedicated to providing
            exceptional products and outstanding customer service.
          </p>
          <p className="text-lg mb-4">
            Our mission is to offer carefully curated, high-quality products
            that enhance your everyday life. We believe in sustainable
            practices, ethical sourcing, and creating lasting relationships with
            our customers.
          </p>
          <p className="text-lg">
            What sets us apart is our commitment to excellence in every aspect
            of our business—from product selection and website experience to
            packaging and customer support. We&apos;re not just selling
            products; we&apos;re creating experiences.
          </p>
        </div>
      </section>

      <section className="mb-16">
        <h2 className="text-2xl font-bold mb-8 text-center">Our Journey</h2>

        <div className="max-w-4xl mx-auto">
          <div className="relative border-l-2 border-gray-300 pl-8 ml-6">
            {companyHistory.map((event, index) => (
              <div key={index} className="mb-10 relative">
                <div className="absolute -left-14 w-10 h-10 bg-gray-800 text-white rounded-full flex items-center justify-center">
                  {event.year}
                </div>
                <h3 className="text-xl font-semibold mb-2">{event.title}</h3>
                <p className="text-gray-600">{event.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section>
        <h2 className="text-2xl font-bold mb-8 text-center">Meet Our Team</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {teamMembers.map((member) => (
            <div
              key={member.id}
              className="bg-white rounded-lg shadow-md overflow-hidden"
            >
              <div className="relative h-64 w-full">
                <Image
                  src={member.image}
                  alt={member.name}
                  fill
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                  className="object-contain p-4"
                />
              </div>
              <div className="p-4">
                <h3 className="text-xl font-semibold mb-1">{member.name}</h3>
                <p className="text-gray-500 text-sm mb-3">{member.position}</p>
                <p className="text-gray-600 text-sm">{member.bio}</p>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
