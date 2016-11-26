class DatagramFinder

  def self.all
    Datagram.where('archived IS DISTINCT FROM true').all.map{|d|
      (d.param_sets || {}).select{|n,v|
        ap v["frequency"]
        (v["frequency"].to_i > 0 || !p["at"].blank?) rescue nil
      }.map{|k,m| o = OpenStruct.new(m.merge("id" => d.id)); o.frequency = o.frequency.to_i; o}
    }.select{|k| !k.blank?}.flatten
  end

end
