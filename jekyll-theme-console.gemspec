# frozen_string_literal: true

Gem::Specification.new do |spec|
  spec.name          = "jekyll-theme-console"
  spec.version       = "0.3.10"
  spec.authors       = ["b2a3e8"]
  spec.email         = ["31370519+b2a3e8@users.noreply.github.com"]

  spec.summary       = "I like to break stuff and whenever I have time to waste, I hack shit and I talk about it here."
  spec.homepage      = "https://github.com/b2a3e8/jekyll-theme-console"
  spec.license       = "MIT"

  spec.files         = `git ls-files -z`.split("\x0").select { |f| f.match(%r!^(assets|_layouts|_includes|_sass|LICENSE|README)!i) }

  spec.add_runtime_dependency "jekyll", ">= 3.5"
  spec.add_runtime_dependency "jekyll-seo-tag"
  spec.add_development_dependency "bundler"
  spec.add_development_dependency "rake"
end
