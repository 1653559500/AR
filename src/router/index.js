import Vue from 'vue'
import VueRouter from 'vue-router'
import Layout from '../views/layout/Layout'
import TokenFactory from '../utils/tokenfactory'

import NProgress from 'nprogress' // Progress 进度条
import 'nprogress/nprogress.css'// Progress 进度条样式

Vue.use(VueRouter)

const routes = [
  {
    path: '/login',
    name: 'Login',
    component: () => import('../views/login/Login.vue')
  },
  {
    path: '/material/preview/:id',
    name: 'SpaceView',
    component: () => import('../views/material/3D/SpaceView.vue')
  },
  {
    path: '',
    component: Layout,
    redirect: '/user/index'
  },
  //用户
  {
    path: '/user',
    component: Layout,
    children: [
      {
        path: 'index',
        component: () => import('@/views/user/Index.vue'),
        meta: {
          auth: true
        },
          children: [
              {
                path: 'role',
                component: () => import('@/views/user/Role.vue')
              },
              {
                  path: 'user',
                  component: () => import('@/views/user/List.vue')
              }
          ]
      }
    ]
  },
    //角色
    {
        path: '/role',
        component: Layout,
        children: [
            {
                path: 'index',
                component: () => import('@/views/user/Role.vue'),
                meta: {
                    auth: true
                }
            }
        ]
    },
    //内容
  {
    path: '/content',
    component: Layout,
    children: [
      {
        path: 'index/:id',
        name: 'content',
        component: () => import('@/views/content/List.vue'),
        meta: {
          auth: true
        }
      },
      {
        path: 'preview/:id',
        component: () => import('@/views/content/Preview.vue'),
        meta: {
          auth: true
        }
      },
    ]
  },
    //项目
    {
      path: '/project',
      component: Layout,
      children: [
          {
              path: 'index',
              component: () => import('@/views/project/List.vue'),
              meta: {
                  auth: true
              }
          },
      ]
    },
   //素材
  {
    path: '/material',
    component: Layout,
    children: [
      {
        path: 'index',
        component: () => import('@/views/material/List.vue'),
        meta: {
          auth: true
        }
      }
    ]
  },
  //图片
  {
    path: "/picture",
    component: Layout,
    children: [
      {
        path: 'index',
        component: () => import('@/views/picture/List.vue'),
        meta: {
          auth: true
        }
      }
    ]
  }
]

const router = new VueRouter({
  mode: 'hash',
  base: process.env.BASE_URL,
  routes
})

router.beforeEach((to, from, next) => {
  NProgress.start()
  let token = TokenFactory.getToken()
  // console.log(token)
  //判断页面是否需要登录
  if(to.meta.auth){// 如果token存在直接跳转
    if(token){
      // console.log(1)
      next()
    }else { // 否则跳转到login登录页面
      // console.log(2)
      next({
        path:'/login',
        // 跳转时传递参数到登录页面，以便登录后可以跳转到对应页面
        // query:{
        //   redirect:to.fullPath
        // }
      })
    }
  }else {
    // 如果不需要登录，则直接跳转到对应页面
    next()
  }
})

router.afterEach(() => {
  NProgress.done() // 结束Progress
})

export default router
