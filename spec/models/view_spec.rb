require 'rails_helper'

describe View do

  context "tauchart" do
    let(:tchart) { {"name"=>"tchart",
                    "render"=>"taucharts",
                    "template"=>"responses.reservations.data[]",
                    "transform"=>"jmespath",
                    "tauChartsOptions"=>
                    {"tco"=>{"x"=>"dt", "y"=>"sum", "type"=>"stacked-bar", "handleRenderingErrors"=>false}, "keys"=>["dt", "sum"]}}
    }
    let(:view) { View.new(tchart) }
    it "should have correct transform" do
      expect(view.transform).to eq("jmespath")
      expect(view["transform"]).to eq("jmespath")
    end
    it "should have correct layout" do
      expect(view.layout_file).to eq("taucharts")
    end
    it "should have correct template" do
      expect(view.template_file).to eq("taucharts")
    end

  end

  context "html" do
    let(:html) {
      {"name"=>"html",
      "render"=>"html",
      "template"=>"<ul>\n{{#each responses.reservations.data}}\n<li>{{this.dt}} - {{this.sum}}</li>\n{{/each}}\n</ul>",
      "transform"=>"handlebars"}
    }
    let(:view) { View.new(html) }
    it "should have correct transform" do
      expect(view.transform).to eq("handlebars")
    end
    it "should have correct layout" do
      expect(view.layout_file).to eq("handlebars")
    end
    it "should have correct template" do
      expect(view.template_file).to eq("handlebars")
    end

  end

end
