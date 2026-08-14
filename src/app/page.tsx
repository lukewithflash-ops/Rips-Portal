{view === "calculator" && (
  <div className="flex flex-wrap gap-2 mb-5">
    {categories.map((cat) => (
      <button
        key={cat.id}
        onClick={() => handleCategory(cat.id)}
        className={...}
      >
        <span className="mr-1">{cat.emoji}</span>
        {cat.label}
      </button>
    ))}
  </div>
)}
