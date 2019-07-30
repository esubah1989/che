/*
 * Copyright (c) 2015-2018 Red Hat, Inc.
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 *
 * Contributors:
 *   Red Hat, Inc. - initial API and implementation
 */
'use strict';

export interface IDevfileMetaData {
  displayName: string;
  description?: string;
  globalMemoryLimit: string;
  icon: string;
  links: any;
  tags: Array<string>;
}


/**
 * This class is handling devfile registry api
 * @author Ann Shumilova
 */
export class DevfileRegistry {
  static $inject = ['$http'];

  /**
   * Angular Http service.
   */
  private $http: ng.IHttpService;

  private devfilesMap: Map<string, che.IWorkspaceDevfile>;

  /**
   * Default constructor that is using resource
   */
  constructor($http: ng.IHttpService) {
    this.$http = $http;
    this.devfilesMap = new Map<string, che.IWorkspaceDevfile>();
  }

  fetchDevfiles(location: string): ng.IPromise<Array<IDevfileMetaData>> {
    let promise = this.$http({ 'method': 'GET', 'url': location + '/devfiles/index.json' });
    return promise.then((result: any) => {
      return result.data;
    });
  }

  fetchDevfile(location: string, link: string): ng.IPromise<che.IWorkspaceDevfile> {
    let promise = this.$http({ 'method': 'GET', 'url': location + link });
    return promise.then((result: any) => {
      let devfile = this.devfileYamlToJson(result.data)
      this.devfilesMap.set(location + link, devfile);
      return devfile;
    });
  }

  getDevfile(location: string, link: string): che.IWorkspaceDevfile {
    return this.devfilesMap.get(location + link);
  }

  selfLinkToDevfileId(selfLink: string): string {
      const regExpExecArray = /^\/devfiles\/([A-Za-z0-9_\-]+)\/devfile.yaml$/i.exec(selfLink);
      if (regExpExecArray !== null) {
         return regExpExecArray[1];
      }

      return selfLink;
  }

  devfileIdToSelfLink(devfileId: string): string {
      if (/^[A-Za-z0-9_\-]+$/i.test(devfileId)) {
        return `/devfiles/${devfileId}/devfile.yaml`;
      }

      return devfileId;
  }

  private devfileYamlToJson(yaml: string): che.IWorkspaceDevfile {
    try {
      return jsyaml.load(yaml);
    } catch (e) {
    }
  }
}
