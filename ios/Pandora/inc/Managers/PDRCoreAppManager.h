//
//  PDR_Application.h
//  Pandora
//
//  Created by Mac Pro on 12-12-22.
//  Copyright 2012 __MyCompanyName__. All rights reserved.
//
#import <Foundation/Foundation.h>
#import "PDRCoreApp.h"

@class PDRCoreAppCongfigParse;
@protocol PDRCoreAppWindowDelegate;

/// 应用管理模块
@interface PDRCoreAppManager : NSObject

/// 当前激活的应用
@property (nonatomic, readonly)PDRCoreApp *activeApp;

/**
 @brief 启动appid 必须保证同名目录在应用目录下才可启动成功
 @param appid 启动的appid
 @param debug
 @return int
 */
- (int)startApp:(NSString*)appid withDebug:(BOOL)debug;
///查询应用
- (PDRCoreApp*)getAppByID:(NSString*)appid;
///重启指定应用
- (void)restart:(PDRCoreApp*)coreApp;
/// 关闭指定的应用
- (void)end:(PDRCoreApp*)coreApp;
/**
 @brief 创建app
 @param location app目录
 @param args 启动参数
 @return int
 */
- (PDRCoreApp*)openAppAtLocation:(NSString*)location
                   withIndexPath:(NSString*)indexPath
                        withArgs:(NSString*)args
                    withDelegate:(id<PDRCoreAppWindowDelegate>)delegate;
@end
