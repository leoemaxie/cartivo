import { motion } from 'motion/react'
import { ChevronDown } from 'lucide-react'
import { useState } from 'react'

export function Terms() {
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    '1': true,
  })

  const toggleSection = (id: string) => {
    setExpandedSections((prev) => ({
      ...prev,
      [id]: !prev[id],
    }))
  }

  const sections = [
    {
      id: '1',
      title: '1. Acceptance of Terms',
      content:
        'By accessing and using Cartivo ("Service"), you accept and agree to be bound by the terms and provision of this agreement. If you do not agree to abide by the above, please do not use this service.',
    },
    {
      id: '2',
      title: '2. Use License',
      content:
        'Permission is granted to temporarily download one copy of the materials (information or software) on Cartivo for personal, non-commercial transitory viewing only. This is the grant of a license, not a transfer of title, and under this license you may not:\n• Modify or copy the materials\n• Use the materials for any commercial purpose or for any public display\n• Attempt to decompile or reverse engineer any software contained on Cartivo\n• Remove any copyright or other proprietary notations from the materials\n• Transfer the materials to another person or "mirror" the materials on any other server',
    },
    {
      id: '3',
      title: '3. Disclaimer',
      content:
        'The materials on Cartivo are provided "as is". Cartivo makes no warranties, expressed or implied, and hereby disclaims and negates all other warranties including, without limitation, implied warranties or conditions of merchantability, fitness for a particular purpose, or non-infringement of intellectual property or other violation of rights.',
    },
    {
      id: '4',
      title: '4. Limitations',
      content:
        'In no event shall Cartivo or its suppliers be liable for damages (including, without limitation, damages for loss of data or profit, or due to business interruption) arising out of the use or inability to use the materials on Cartivo.',
    },
    {
      id: '5',
      title: '5. Accuracy of Materials',
      content:
        'The materials appearing on Cartivo could include technical, typographical, or photographic errors. Cartivo does not warrant that any of the materials on its website are accurate, complete, or current. Cartivo may make changes to the materials contained on its website at any time without notice.',
    },
    {
      id: '6',
      title: '6. Links',
      content:
        'Cartivo has not reviewed all of the sites linked to its website and is not responsible for the contents of any such linked site. The inclusion of any link does not imply endorsement by Cartivo of the site. Use of any such linked website is at the user\'s own risk.',
    },
    {
      id: '7',
      title: '7. Modifications',
      content:
        'Cartivo may revise these terms of service for its website at any time without notice. By using this website you are agreeing to be bound by the then current version of these terms of service.',
    },
    {
      id: '8',
      title: '8. Governing Law',
      content:
        'These terms and conditions are governed by and construed in accordance with the laws of the jurisdiction in which Cartivo operates, and you irrevocably submit to the exclusive jurisdiction of the courts in that location.',
    },
    {
      id: '9',
      title: '9. User Accounts',
      content:
        'If you create an account on Cartivo, you are responsible for maintaining the confidentiality of your password and for all activities that occur under your account. You agree to notify us immediately of any unauthorized use of your account.',
    },
    {
      id: '10',
      title: '10. AI and Recommendations',
      content:
        'Cartivo uses artificial intelligence to provide product recommendations and insights. While we strive for accuracy, AI recommendations are not guaranteed to be perfect. Users should exercise their own judgment when making purchase decisions.',
    },
  ]

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-white via-indigo-50 to-purple-50 overflow-hidden">
      {/* Background Orbs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1 }}
          className="absolute top-20 left-10 w-72 h-72 bg-indigo-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20"
        />
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 0.2 }}
          className="absolute top-40 right-20 w-72 h-72 bg-purple-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20"
        />
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 0.4 }}
          className="absolute bottom-20 left-1/2 w-72 h-72 bg-indigo-100 rounded-full mix-blend-multiply filter blur-3xl opacity-20"
        />
      </div>

      <div className="relative z-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="px-6 sm:px-12 lg:px-24 py-12 border-b border-slate-200/50 backdrop-blur-sm"
        >
          <div className="max-w-4xl mx-auto">
            <h1 className="text-5xl font-bold text-slate-900 mb-4">Terms of Service</h1>
            <p className="text-lg text-slate-600">
              Please read these terms and conditions carefully before using Cartivo
            </p>
            <p className="text-sm text-slate-500 mt-3">Last updated: February 20, 2026</p>
          </div>
        </motion.div>

        {/* Content */}
        <div className="px-6 sm:px-12 lg:px-24 py-12">
          <div className="max-w-4xl mx-auto">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="space-y-4"
            >
              {sections.map((section, index) => (
                <motion.div
                  key={section.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 + index * 0.05 }}
                  className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-md transition-shadow"
                >
                  <button
                    onClick={() => toggleSection(section.id)}
                    className="w-full px-6 py-4 flex items-center justify-between hover:bg-slate-50 transition-colors"
                  >
                    <h3 className="text-lg font-semibold text-slate-900 text-left">{section.title}</h3>
                    <ChevronDown
                      className={`w-5 h-5 text-slate-400 transition-transform ${
                        expandedSections[section.id] ? 'rotate-180' : ''
                      }`}
                    />
                  </button>

                  <motion.div
                    initial={false}
                    animate={{
                      height: expandedSections[section.id] ? 'auto' : 0,
                      opacity: expandedSections[section.id] ? 1 : 0,
                    }}
                    transition={{ duration: 0.3 }}
                    className="overflow-hidden border-t border-slate-100"
                  >
                    <p className="px-6 py-4 text-slate-600 whitespace-pre-line">{section.content}</p>
                  </motion.div>
                </motion.div>
              ))}
            </motion.div>

            {/* Contact Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 }}
              className="mt-12 bg-indigo-50 rounded-xl border border-indigo-200 p-6"
            >
              <h2 className="text-xl font-bold text-slate-900 mb-3">Questions?</h2>
              <p className="text-slate-600">
                If you have any questions about these Terms of Service, please contact us at{' '}
                <a href="mailto:legal@cartivo.com" className="text-indigo-600 hover:text-indigo-700 font-semibold">
                  legal@cartivo.com
                </a>
              </p>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  )
}
