import React from 'react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import SectionHeading from '../components/SectionHeading';

const REVIEWS = [
  { name:'Rajesh Kumar',  company:'Builder, Mumbai',      initials:'RK', stars:5, text:'NP Construction completed our 8-storey residential building\'s complete steel framework in record time. Professional team, zero compromise on safety. Highly recommended to all builders!' },
  { name:'Amit Sharma',   company:'Developer, Pune',      initials:'AS', stars:5, text:'Excellent fabrication and erection work for our residential complex. Precise joints, great weld quality, and the team was on-site every day without fail. Have engaged them for three more projects since.' },
  { name:'Suresh Patel',  company:'Factory Owner, Ahmedabad', initials:'SP', stars:5, text:'Best fabrication contractor in the region. Our warehouse steel structure was done perfectly and within budget. Very knowledgeable and responsive.' },
  { name:'Mahesh Verma',  company:'Developer, Navi Mumbai',initials:'MV', stars:5, text:'Their team was disciplined, followed all safety norms, and the quality of structural steel work was excellent. Will definitely work again.' },
  { name:'Dinesh Gupta',  company:'Factory Owner, Nagpur', initials:'DG', stars:5, text:'Outstanding welding work on our factory structure. 800 MT delivered ahead of schedule. Very happy!' },
  { name:'Priya Desai',   company:'Structural Engineer, Bangalore',initials:'PD', stars:5, text:'Mobilized within 3 days. Their IS 800 compliance and attention to connection details and weld quality was commendable. Best iron contractor I\'ve worked with.' },
  { name:'Vikram Rao',    company:'MD, VR Developers',     initials:'VR', stars:5, text:'Our go-to contractor for all structural iron and steel work. Pricing is fair and quality is consistently high across all sites.' },
  { name:'Sanjay Kadam',  company:'Business Owner, Kolhapur',initials:'SK', stars:5, text:'Excellent roof truss fabrication and quick erection. The team cleaned up after completion — very professional.' },
  { name:'Arun Joshi',    company:'Plant Manager, Pune',   initials:'AJ', stars:5, text:'Coordinated everything from material procurement to final erection. Delivered on time and on budget. Excellent team!' },
];

export default function Testimonials() {
  return (
    <>
      <Helmet>
        <title>Testimonials | NP Construction – Client Reviews India</title>
        <meta name="description" content="Read what our clients say about NP Construction. Trusted by builders and developers across India." />
      </Helmet>

      <div className="bg-gradient-to-br from-[#0A1628] to-[#1a2d50] pt-32 pb-16 text-center">
        <h1 className="text-4xl sm:text-5xl font-black text-white">
          Client <span className="text-orange-400">Reviews</span>
        </h1>
        <p className="text-white/60 mt-3">Trusted by 350+ builders and developers across India</p>
      </div>

      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4">
          {/* Rating summary */}
          <div className="flex flex-wrap items-center justify-center gap-10 bg-gray-50 rounded-2xl p-8 mb-16">
            {[{val:'4.9',lbl:'Average Rating',sub:Array(5).fill('⭐').join('')},{val:'350+',lbl:'Happy Clients'},{val:'98%',lbl:'Repeat Business Rate'}].map((s,i) => (
              <React.Fragment key={i}>
                <div className="text-center">
                  <div className="text-5xl font-black text-[#0A1628]">{s.val}</div>
                  {s.sub && <div className="text-yellow-400 text-base mt-1">{s.sub}</div>}
                  <div className="text-gray-400 text-sm mt-1">{s.lbl}</div>
                </div>
                {i < 2 && <div className="w-px h-16 bg-gray-200 hidden sm:block" />}
              </React.Fragment>
            ))}
          </div>

          <SectionHeading label="What Clients Say" heading="Words from Our" highlight="Happy Clients"
            sub="Real reviews from builders, developers, and factory owners we've worked with." />

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-7 mt-14">
            {REVIEWS.map((r, i) => (
              <motion.div key={r.name}
                initial={{ opacity:0, y:20 }} whileInView={{ opacity:1, y:0 }}
                viewport={{ once:true }} transition={{ delay: i * 0.06 }}
                className="bg-white rounded-2xl p-7 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all">
                <div className="flex gap-0.5 mb-3">
                  {[...Array(r.stars)].map((_,j) => <i key={j} className="fas fa-star text-yellow-400 text-sm" />)}
                </div>
                <div className="text-5xl text-orange-400/15 font-serif leading-none mb-2">"</div>
                <p className="text-gray-500 text-sm leading-relaxed italic mb-5">{r.text}</p>
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 bg-[#0A1628] rounded-full flex items-center justify-center text-white font-bold text-sm shrink-0">
                    {r.initials}
                  </div>
                  <div>
                    <div className="font-bold text-[#0A1628] text-sm">{r.name}</div>
                    <div className="text-gray-400 text-xs">{r.company}</div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 bg-gradient-to-br from-[#0A1628] to-[#1a2d50]">
        <div className="max-w-2xl mx-auto px-4 text-center">
          <h2 className="text-2xl font-black text-white mb-4">Join Our <span className="text-orange-400">Happy Clients</span></h2>
          <div className="flex gap-4 justify-center flex-wrap">
            <Link to="/contact" className="bg-orange-500 hover:bg-orange-400 text-white font-bold px-7 py-3 rounded-xl inline-flex items-center gap-2 transition-all">
              <i className="fas fa-file-alt" /> Get Free Quote
            </Link>
            <a href="https://wa.me/917016593309" target="_blank" rel="noopener"
              className="border-2 border-white text-white hover:bg-white hover:text-[#0A1628] font-bold px-7 py-3 rounded-xl inline-flex items-center gap-2 transition-all">
              <i className="fab fa-whatsapp" /> WhatsApp Us
            </a>
          </div>
        </div>
      </section>
    </>
  );
}
