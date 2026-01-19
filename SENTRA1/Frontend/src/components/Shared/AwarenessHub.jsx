import React, { useState } from "react";
import { BookOpen, Shield, Phone, AlertCircle, FileText } from "lucide-react";

const AWARENESS_CONTENT = [
  {
    id: 1,
    title: "Anti-Harassment Policy",
    category: "Policy",
    content:
      "Harassment of any form is strictly prohibited on campus.\n\nThis includes verbal abuse, physical misconduct, cyber harassment, and discrimination based on gender, caste, religion, or background.",
  },
  {
    id: 2,
    title: "Anti-Ragging Policy",
    category: "Policy",
    content:
      "Ragging is a punishable offense.\n\nAny student found engaging in ragging activities will face strict disciplinary action including suspension or expulsion.",
  },
  {
    id: 3,
    title: "Campus Security",
    category: "Contact",
    content:
      "Campus Security Office\nPhone: +91 98765 43210\nLocation: Main Gate Security Cabin",
  },
  {
    id: 4,
    title: "Student Counseling Cell",
    category: "Contact",
    content:
      "Confidential counseling services are available for students.\n\nPhone: +91 91234 56789\nLocation: Block B, Room 102",
  },
  {
    id: 5,
    title: "Emergency Safety Tips",
    category: "Safety Tips",
    content:
      "• Stay calm and alert\n• Inform authorities immediately\n• Avoid confrontation\n• Use emergency exits during evacuation",
  },
  {
    id: 6,
    title: "How to Report an Incident",
    category: "Guide",
    content:
      "1. Go to the 'Report Incident' page\n2. Fill in the details accurately\n3. Attach evidence if available\n4. Submit anonymously if required",
  },
];

const AwarenessHub = () => {
  const [selectedCategory, setSelectedCategory] = useState("all");

  const categories = [
    "all",
    ...new Set(AWARENESS_CONTENT.map((item) => item.category)),
  ];

  const filteredContent =
    selectedCategory === "all"
      ? AWARENESS_CONTENT
      : AWARENESS_CONTENT.filter(
          (item) => item.category === selectedCategory
        );

  const getIcon = (category) => {
    switch (category) {
      case "Policy":
        return Shield;
      case "Contact":
        return Phone;
      case "Safety Tips":
        return AlertCircle;
      case "Guide":
        return FileText;
      default:
        return BookOpen;
    }
  };

  const getCategoryColor = (category) => {
    switch (category) {
      case "Policy":
        return "bg-blue-100 text-blue-800";
      case "Contact":
        return "bg-green-100 text-green-800";
      case "Safety Tips":
        return "bg-yellow-100 text-yellow-800";
      case "Guide":
        return "bg-purple-100 text-purple-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg shadow-lg p-8 text-white mb-6">
        <div className="flex items-center space-x-3 mb-2">
          <BookOpen size={36} />
          <h1 className="text-3xl font-bold">Awareness Hub</h1>
        </div>
        <p className="text-blue-100">
          Campus policies, safety guidelines, and important contacts
        </p>
      </div>

      {/* Category Filter */}
      <div className="bg-white rounded-lg shadow p-4 mb-6">
        <div className="flex flex-wrap gap-2">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-2 rounded-lg font-medium transition ${
                selectedCategory === cat
                  ? "bg-blue-600 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              {cat === "all" ? "All" : cat}
            </button>
          ))}
        </div>
      </div>

      {/* Content Grid */}
      <div className="grid md:grid-cols-2 gap-6">
        {filteredContent.map((item) => {
          const Icon = getIcon(item.category);
          return (
            <div
              key={item.id}
              className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition"
            >
              <div className="flex items-start space-x-4">
                <div className="p-3 bg-blue-100 rounded-lg">
                  <Icon className="text-blue-600" size={24} />
                </div>
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-xl font-bold text-gray-800">
                      {item.title}
                    </h3>
                    <span
                      className={`px-2 py-1 rounded text-xs font-medium ${getCategoryColor(
                        item.category
                      )}`}
                    >
                      {item.category}
                    </span>
                  </div>
                  <p className="text-gray-600 whitespace-pre-wrap">
                    {item.content}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default AwarenessHub;