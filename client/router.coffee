
    Router.map ->
  @route 'aboutMe',
    path: '/'
    template: 'aboutMe'

  @route 'portfolio',
    path: '/portfolio'
    template: 'portfolio'

  @route 'notFound',
    path: '*'
    where: 'server'
    action: ->
      @response.statusCode = 404
      @response.end Handlebars.templates['404']()

